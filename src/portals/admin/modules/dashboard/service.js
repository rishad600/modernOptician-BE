import User from '../../../../models/user.model.js';
import Course from '../../../../models/course.model.js';
import Enrollment from '../../../../models/entrollment.js';
import Activity from '../../../../models/activity.js';
import moment from 'moment-timezone';
import config from '../../../../config/config.js';

const getDashboardData = async (filters = {}) => {
    const timezone = config.timezone;
    // 1. Build Base Match Queries based on filters
    const dateQuery = {};
    if (filters.startDate || filters.endDate) {
        dateQuery.createdAt = {};
        if (filters.startDate) dateQuery.createdAt.$gte = moment.tz(filters.startDate, timezone).toDate();
        if (filters.endDate) dateQuery.createdAt.$lte = moment.tz(filters.endDate, timezone).toDate();
    }

    const courseQuery = { isTrash: false, status: 'Published', ...dateQuery };
    if (filters.category) {
        courseQuery.category = filters.category;
    }

    const userQuery = { isTrash: false, isActive: true, ...dateQuery };

    const enrollmentQuery = { paymentStatus: 'completed', ...dateQuery };
    // If course category is filtered, we need to first find the matching courses to filter enrollments
    if (filters.category) {
        const matchingCourses = await Course.find({ category: filters.category, isTrash: false }).select('_id');
        const courseIds = matchingCourses.map(c => c._id);
        enrollmentQuery.courseId = { $in: courseIds };
    }

    const activityQuery = { ...dateQuery };
    if (filters.category) {
        const matchingCourses = await Course.find({ category: filters.category, isTrash: false }).select('_id');
        const courseIds = matchingCourses.map(c => c._id);
        activityQuery.courseId = { $in: courseIds };
    }

    // 2. Overview Stats (Filtered)
    const totalStudentsCount = await User.countDocuments(userQuery);
    const activeCoursesCount = await Course.countDocuments(courseQuery);

    // We get enrollments
    const enrollments = await Enrollment.find(enrollmentQuery);
    const totalRevenue = enrollments.reduce((sum, enr) => sum + (enr.amountPaid || 0), 0);
    const totalEnrollments = enrollments.length;

    // Growth metrics calculations
    const now = moment.tz(timezone);
    const currMonthStart = now.clone().startOf('month').toDate();
    const prevMonthStart = now.clone().subtract(1, 'month').startOf('month').toDate();

    // Merge base user/course queries with growth date queries
    const growthUserQueryCurr = { ...userQuery, createdAt: { ...userQuery.createdAt, $gte: currMonthStart } };
    const growthUserQueryPrev = { ...userQuery, createdAt: { ...userQuery.createdAt, $gte: prevMonthStart, $lt: currMonthStart } };

    const studentsThisMonth = await User.countDocuments(growthUserQueryCurr);
    const studentsLastMonth = await User.countDocuments(growthUserQueryPrev);
    const studentGrowth = studentsLastMonth === 0 ? (studentsThisMonth > 0 ? 100 : 0) : Math.round(((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100);

    const revenueThisMonth = enrollments.filter(e => moment(e.createdAt).isSameOrAfter(currMonthStart)).reduce((sum, e) => sum + (e.amountPaid || 0), 0);
    const revenueLastMonth = enrollments.filter(e => moment(e.createdAt).isSameOrAfter(prevMonthStart) && moment(e.createdAt).isBefore(currMonthStart)).reduce((sum, e) => sum + (e.amountPaid || 0), 0);
    const revenueGrowth = revenueLastMonth === 0 ? (revenueThisMonth > 0 ? 100 : 0) : Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);

    const enrollmentsThisMonth = enrollments.filter(e => moment(e.createdAt).isSameOrAfter(currMonthStart)).length;
    const enrollmentsLastMonth = enrollments.filter(e => moment(e.createdAt).isSameOrAfter(prevMonthStart) && moment(e.createdAt).isBefore(currMonthStart)).length;
    const enrollmentGrowth = enrollmentsLastMonth === 0 ? (enrollmentsThisMonth > 0 ? 100 : 0) : Math.round(((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth) * 100);

    const growthCourseQueryCurr = { ...courseQuery, createdAt: { ...courseQuery.createdAt, $gte: currMonthStart } };
    const coursesThisMonth = await Course.countDocuments(growthCourseQueryCurr);

    // 3. Revenue Trend (6 Months)
    const sixMonthsAgo = now.clone().subtract(5, 'months').startOf('month').toDate();

    const trendMatch = { ...enrollmentQuery };
    if (!trendMatch.createdAt) trendMatch.createdAt = {};
    if (!trendMatch.createdAt.$gte || moment(trendMatch.createdAt.$gte).isBefore(sixMonthsAgo)) {
        trendMatch.createdAt.$gte = sixMonthsAgo;
    }

    const revenueTrendData = await Enrollment.aggregate([
        { $match: trendMatch },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                total: { $sum: "$amountPaid" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthsSuffix = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueTrend = revenueTrendData.map(item => ({
        month: monthsSuffix[item._id.month - 1],
        total: item.total
    }));

    const paddedRevenueTrend = [];
    for (let i = 5; i >= 0; i--) {
        const d = now.clone().subtract(i, 'months');
        const mName = monthsSuffix[d.month()];
        const existingMonth = revenueTrend.find(r => r.month === mName);
        if (existingMonth) {
            paddedRevenueTrend.push(existingMonth);
        } else {
            paddedRevenueTrend.push({ month: mName, total: 0 });
        }
    }

    // 4. Monthly Enrollment Breakdown
    const enrollmentBreakdownData = await Enrollment.aggregate([
        { $match: enrollmentQuery },
        {
            $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "course"
            }
        },
        { $unwind: "$course" },
        { $match: filters.category ? { "course.category": filters.category } : {} },
        {
            $group: {
                _id: "$course.category",
                count: { $sum: 1 }
            }
        }
    ]);

    const enrollmentBreakdown = enrollmentBreakdownData.map(item => ({
        category: item._id,
        count: item.count
    }));

    // 5. Recent Activity
    const recentActivities = await Activity.find(activityQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({ path: 'studentId', model: 'User', select: 'name email' })
        .populate('courseId', 'name');

    return {
        overview: {
            totalStudents: {
                value: totalStudentsCount,
                growth: studentGrowth
            },
            totalRevenue: {
                value: totalRevenue,
                growth: revenueGrowth
            },
            activeCourses: {
                value: activeCoursesCount,
                growth: coursesThisMonth > 0 ? 5 : 0
            },
            recentEnrollments: {
                value: totalEnrollments,
                growth: enrollmentGrowth
            }
        },
        revenueTrend: paddedRevenueTrend,
        enrollmentBreakdown,
        recentActivities
    };
};

export default {
    getDashboardData
};
