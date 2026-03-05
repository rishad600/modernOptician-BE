import User from '../../../../models/user.model.js';
import Course from '../../../../models/course.model.js';
import Enrollment from '../../../../models/entrollment.js';
import Activity from '../../../../models/activity.js';

const getDashboardData = async (filters = {}) => {
    // 1. Build Base Match Queries based on filters
    const dateQuery = {};
    if (filters.startDate || filters.endDate) {
        dateQuery.createdAt = {};
        if (filters.startDate) dateQuery.createdAt.$gte = filters.startDate;
        if (filters.endDate) dateQuery.createdAt.$lte = filters.endDate;
    }

    const courseQuery = { isTrash: false, isPublished: true, ...dateQuery };
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

    // Growth metrics calculations (comparing current month to previous month, respecting filters if applied)
    // Note: If explicit date filters are applied, growth metrics comparing "this month" vs "last month" 
    // might be less relevant, but we calculate them based on the current date for the dashboard widgets.
    const now = new Date();
    const currMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Merge base user/course queries with growth date queries
    const growthUserQueryCurr = { ...userQuery, createdAt: { ...userQuery.createdAt, $gte: currMonthStart } };
    const growthUserQueryPrev = { ...userQuery, createdAt: { ...userQuery.createdAt, $gte: prevMonthStart, $lt: currMonthStart } };

    const studentsThisMonth = await User.countDocuments(growthUserQueryCurr);
    const studentsLastMonth = await User.countDocuments(growthUserQueryPrev);
    const studentGrowth = studentsLastMonth === 0 ? (studentsThisMonth > 0 ? 100 : 0) : Math.round(((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100);

    const revenueThisMonth = enrollments.filter(e => e.createdAt >= currMonthStart).reduce((sum, e) => sum + (e.amountPaid || 0), 0);
    const revenueLastMonth = enrollments.filter(e => e.createdAt >= prevMonthStart && e.createdAt < currMonthStart).reduce((sum, e) => sum + (e.amountPaid || 0), 0);
    const revenueGrowth = revenueLastMonth === 0 ? (revenueThisMonth > 0 ? 100 : 0) : Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);

    const enrollmentsThisMonth = enrollments.filter(e => e.createdAt >= currMonthStart).length;
    const enrollmentsLastMonth = enrollments.filter(e => e.createdAt >= prevMonthStart && e.createdAt < currMonthStart).length;
    const enrollmentGrowth = enrollmentsLastMonth === 0 ? (enrollmentsThisMonth > 0 ? 100 : 0) : Math.round(((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth) * 100);

    const growthCourseQueryCurr = { ...courseQuery, createdAt: { ...courseQuery.createdAt, $gte: currMonthStart } };
    const coursesThisMonth = await Course.countDocuments(growthCourseQueryCurr);

    // 3. Revenue Trend (6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // If there's a custom date range that starts after sixMonthsAgo, trend will naturally just match that later timeframe
    // But we build an aggregation match query merging enrollment filters and our 6-month baseline
    const trendMatch = { ...enrollmentQuery };
    if (!trendMatch.createdAt) trendMatch.createdAt = {};
    if (!trendMatch.createdAt.$gte || new Date(trendMatch.createdAt.$gte) < sixMonthsAgo) {
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

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueTrend = revenueTrendData.map(item => ({
        month: months[item._id.month - 1],
        total: item.total
    }));

    const paddedRevenueTrend = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mName = months[d.getMonth()];
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
        // If category filter is applied, we only group that one matching category anyway
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
