import User from "../../../../models/user.model.js";
import Enrollment from "../../../../models/enrollment.model.js";
import mongoose from "mongoose";
import moment from "moment-timezone";
import config from "../../../../config/config.js";

const getUsersList = async (keyword, status, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const matchCondition = {};

    if (status) {
        matchCondition.isTrash = status === 'Active' ? false : true;
    }

    const pipeline = [{ $match: matchCondition }];

    if (keyword) {
        pipeline.push({
            $addFields: {
                fullName: { $concat: ["$name", " ", { $ifNull: ["$lastName", ""] }] },
            },
        });
        pipeline.push({
            $match: {
                $or: [
                    { fullName: { $regex: keyword, $options: "i" } },
                    { email: { $regex: keyword, $options: "i" } },
                    { studentId: { $regex: keyword, $options: "i" } },
                ],
            },
        });
    }

    pipeline.push(
        {
            $lookup: {
                from: "enrollments",
                localField: "_id",
                foreignField: "studentId",
                as: "enrollments",
            },
        },
        {
            $addFields: {
                totalSpent: {
                    $sum: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$enrollments",
                                    as: "e",
                                    cond: { $eq: ["$$e.paymentStatus", "completed"] },
                                },
                            },
                            as: "e",
                            in: "$$e.amountPaid",
                        },
                    },
                },
                coursesCount: {
                    $size: {
                        $filter: {
                            input: "$enrollments",
                            as: "e",
                            cond: { $eq: ["$$e.paymentStatus", "completed"] },
                        },
                    },
                },
            },
        },
        {
            $project: {
                name: 1,
                lastName: 1,
                email: 1,
                studentId: 1,
                createdAt: 1,
                isTrash: 1,
                totalSpent: 1,
                coursesCount: 1,
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                users: [{ $skip: skip }, { $limit: Number(limit) }],
                totalCount: [{ $count: "count" }],
            },
        }
    );

    const result = await User.aggregate(pipeline);

    const users = result[0].users;
    const totalCount = result[0].totalCount[0]?.count || 0;
    const nextPage = totalCount > limit * page ? page + 1 : -1;
    return { users, totalCount, nextPage };
};

// Why this is now simpler than the old aggregation: User.enrolledCourses is gone, so we
// just look up the user, then fetch their completed enrollments + the linked course names.
const getStudentById = async (id) => {
    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(id) }).lean();
    if (!user) return null;

    const enrollments = await Enrollment.aggregate([
        { $match: { studentId: user._id } },
        {
            $lookup: {
                from: 'courses',
                localField: 'courseId',
                foreignField: '_id',
                as: 'course',
            },
        },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                courseId: 1,
                enrolledAt: 1,
                isCompleted: 1,
                completedAt: 1,
                amountPaid: 1,
                paymentStatus: 1,
                courseName: '$course.name',
            },
        },
        { $sort: { enrolledAt: -1 } },
    ]);

    return { ...user, enrollments };
};

const deleteStudent = async (id) => {
    const existing = await User.findById(id).select('isTrash');
    if (!existing) return false;
    if (existing.isTrash) return -1;

    const result = await User.updateOne({ _id: id }, { isTrash: true });
    if (result.modifiedCount === 0) return false;
    return true;
};

const getStats = async () => {
    const timezone = config.timezone;
    const now = moment.tz(timezone);
    const oneWeekAgo = now.clone().subtract(7, 'days').toDate();
    const twoWeeksAgo = now.clone().subtract(14, 'days').toDate();

    const [
        totalStudents,
        totalStudentsThisWeek,
        activeStudents,
        activeStudentsThisWeek,
        activeStudentsLastWeek,
        completionsAgg,
    ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
        User.countDocuments({ isTrash: { $ne: true } }),
        User.countDocuments({ isTrash: { $ne: true }, createdAt: { $gte: oneWeekAgo } }),
        User.countDocuments({
            isTrash: { $ne: true },
            createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
        }),
        // Course completions live on Enrollment now (formerly on User.enrolledCourses).
        Enrollment.aggregate([
            { $match: { isCompleted: true } },
            {
                $group: {
                    _id: null,
                    totalCompletions: { $sum: 1 },
                    thisWeekCompletions: {
                        $sum: { $cond: [{ $gte: ['$completedAt', oneWeekAgo] }, 1, 0] },
                    },
                    lastWeekCompletions: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ['$completedAt', twoWeeksAgo] },
                                        { $lt: ['$completedAt', oneWeekAgo] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]),
    ]);

    let activeStudentsGrowth = 0;
    if (activeStudentsLastWeek > 0) {
        activeStudentsGrowth =
            ((activeStudentsThisWeek - activeStudentsLastWeek) / activeStudentsLastWeek) * 100;
    } else if (activeStudentsThisWeek > 0) {
        activeStudentsGrowth = 100;
    }

    const completionsData = completionsAgg[0] || {
        totalCompletions: 0,
        thisWeekCompletions: 0,
        lastWeekCompletions: 0,
    };

    let completionsGrowth = 0;
    if (completionsData.lastWeekCompletions > 0) {
        completionsGrowth =
            ((completionsData.thisWeekCompletions - completionsData.lastWeekCompletions) /
                completionsData.lastWeekCompletions) * 100;
    } else if (completionsData.thisWeekCompletions > 0) {
        completionsGrowth = 100;
    }

    return {
        totalStudents,
        totalStudentsThisWeek,
        activeStudents,
        activeStudentsGrowth: Math.round(activeStudentsGrowth),
        completions: completionsData.totalCompletions,
        completionsGrowth: Math.round(completionsGrowth),
    };
};

export default {
    getUsersList,
    getStudentById,
    deleteStudent,
    getStats,
};
