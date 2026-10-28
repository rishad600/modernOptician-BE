import User from '../../../../models/user.model.js';
import Course from '../../../../models/course.model.js';
import Enrollment from '../../../../models/enrollment.model.js';
import Activity from '../../../../models/activity.model.js';
import moment from 'moment-timezone';
import config from '../../../../config/config.js';

const computeGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};

/**
 * Build the dashboard payload.
 *
 * Why this is one function instead of N round-trips: the previous version pulled
 * every completed enrollment into Node memory and computed revenue/growth/trend
 * with .reduce/.filter — fine at 100 rows, catastrophic at 100k. Now everything
 * server-side runs as countDocuments or aggregations, and we issue them in parallel.
 */
const getDashboardData = async (filters = {}) => {
    const timezone = config.timezone;
    const now = moment.tz(timezone);
    const currMonthStart = now.clone().startOf('month').toDate();
    const prevMonthStart = now.clone().subtract(1, 'month').startOf('month').toDate();
    const sixMonthsAgo = now.clone().subtract(5, 'months').startOf('month').toDate();

    // 1. Build base date filter.
    const dateRange = {};
    if (filters.startDate) dateRange.$gte = moment.tz(filters.startDate, timezone).toDate();
    if (filters.endDate) dateRange.$lte = moment.tz(filters.endDate, timezone).toDate();

    const userMatch = { isTrash: false, isActive: true };
    const courseMatch = { isTrash: false, status: 'Published' };
    const enrollmentMatch = { paymentStatus: 'completed' };
    const activityMatch = {};
    if (Object.keys(dateRange).length) {
        userMatch.createdAt = dateRange;
        courseMatch.createdAt = dateRange;
        enrollmentMatch.createdAt = dateRange;
        activityMatch.createdAt = dateRange;
    }

    // 2. If a category filter is set, scope enrollments and activities to that category's courses.
    if (filters.category) {
        courseMatch.category = filters.category;
        const courseIds = await Course.find(
            { category: filters.category, isTrash: false },
            { _id: 1 }
        ).lean();
        const ids = courseIds.map((c) => c._id);
        enrollmentMatch.courseId = { $in: ids };
        activityMatch.courseId = { $in: ids };
    }

    // 3. Issue everything in parallel.
    const [
        totalStudentsCount,
        studentsThisMonth,
        studentsLastMonth,
        activeCoursesCount,
        coursesThisMonth,
        enrollmentStats,
        recentActivities,
    ] = await Promise.all([
        User.countDocuments(userMatch),
        User.countDocuments({ ...userMatch, createdAt: { ...dateRange, $gte: currMonthStart } }),
        User.countDocuments({
            ...userMatch,
            createdAt: { ...dateRange, $gte: prevMonthStart, $lt: currMonthStart },
        }),
        Course.countDocuments(courseMatch),
        Course.countDocuments({ ...courseMatch, createdAt: { ...dateRange, $gte: currMonthStart } }),
        // Single aggregation that returns every enrollment-derived number.
        Enrollment.aggregate([
            { $match: enrollmentMatch },
            {
                $facet: {
                    // Headline totals over the full filter window.
                    totals: [
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: '$amountPaid' },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    // This-month vs last-month for revenue and enrollment growth.
                    monthly: [
                        { $match: { createdAt: { $gte: prevMonthStart } } },
                        {
                            $group: {
                                _id: {
                                    $cond: [{ $gte: ['$createdAt', currMonthStart] }, 'curr', 'prev'],
                                },
                                revenue: { $sum: '$amountPaid' },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    // 6-month revenue trend.
                    revenueTrend: [
                        { $match: { createdAt: { $gte: sixMonthsAgo } } },
                        {
                            $group: {
                                _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
                                total: { $sum: '$amountPaid' },
                            },
                        },
                        { $sort: { '_id.y': 1, '_id.m': 1 } },
                    ],
                    // Breakdown by course category.
                    breakdown: [
                        {
                            $lookup: {
                                from: 'courses',
                                localField: 'courseId',
                                foreignField: '_id',
                                as: 'course',
                            },
                        },
                        { $unwind: '$course' },
                        ...(filters.category
                            ? [{ $match: { 'course.category': filters.category } }]
                            : []),
                        { $group: { _id: '$course.category', count: { $sum: 1 } } },
                    ],
                },
            },
        ]),
        Activity.find(activityMatch)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('studentId', 'name email')
            .populate('courseId', 'name')
            .lean(),
    ]);

    // 4. Stitch the aggregation result back into the response shape.
    const stats = enrollmentStats[0] || {};
    const totals = stats.totals?.[0] || { revenue: 0, count: 0 };
    const monthlyMap = (stats.monthly || []).reduce((acc, row) => {
        acc[row._id] = row;
        return acc;
    }, {});
    const curr = monthlyMap.curr || { revenue: 0, count: 0 };
    const prev = monthlyMap.prev || { revenue: 0, count: 0 };

    const monthsSuffix = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendByMonth = (stats.revenueTrend || []).reduce((acc, row) => {
        acc[`${row._id.y}-${row._id.m}`] = row.total;
        return acc;
    }, {});
    const paddedRevenueTrend = [];
    for (let i = 5; i >= 0; i--) {
        const d = now.clone().subtract(i, 'months');
        const key = `${d.year()}-${d.month() + 1}`;
        paddedRevenueTrend.push({
            month: monthsSuffix[d.month()],
            total: trendByMonth[key] || 0,
        });
    }

    const enrollmentBreakdown = (stats.breakdown || []).map((row) => ({
        category: row._id,
        count: row.count,
    }));

    return {
        overview: {
            totalStudents: {
                value: totalStudentsCount,
                growth: computeGrowth(studentsThisMonth, studentsLastMonth),
            },
            totalRevenue: {
                value: totals.revenue,
                growth: computeGrowth(curr.revenue, prev.revenue),
            },
            activeCourses: {
                value: activeCoursesCount,
                growth: coursesThisMonth > 0 ? 5 : 0,
            },
            recentEnrollments: {
                value: totals.count,
                growth: computeGrowth(curr.count, prev.count),
            },
        },
        revenueTrend: paddedRevenueTrend,
        enrollmentBreakdown,
        recentActivities,
    };
};

export default {
    getDashboardData,
};
