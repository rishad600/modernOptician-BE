import User from "../../../../models/user.model.js";
import mongoose from "mongoose";
import moment from "moment-timezone";
import config from "../../../../config/config.js";

const getUsersList = async (keyword, status, page = 1, limit = 20) => {
    try {
        const skip = (page - 1) * limit;
        let matchCondition = {};

        if (keyword) {
            matchCondition.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } },
                { studentId: { $regex: keyword, $options: "i" } }
            ];
        }

        if (status) {
            matchCondition.isTrash = status === 'Active' ? false : true;
        }

        const result = await User.aggregate([
            { $match: matchCondition },
            {
                $lookup: {
                    from: "enrollments",
                    localField: "_id",
                    foreignField: "studentId",
                    as: "enrollments"
                }
            },
            {
                $addFields: {
                    totalSpent: { $sum: "$enrollments.amountPaid" },
                    coursesCount: { $size: { $ifNull: ["$enrolledCourses", []] } }
                }
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
                    coursesCount: 1
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    users: [{ $skip: skip }, { $limit: Number(limit) }],
                    totalCount: [{ $count: "count" }]
                }
            }
        ]);

        const users = result[0].users;
        const totalCount = result[0].totalCount[0]?.count || 0;
        const nextPage = totalCount > (limit * page) ? page + 1 : -1;
        return { users, totalCount, nextPage };
    } catch (error) {
        throw error;
    }
};

const getStudentById = async (id) => {
    try {
        const student = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            // If they have no enrolledCourses, unwind might skip them. 
            // So we use $project to ensure we have at least an empty array.
            {
                $project: {
                    name: 1,
                    lastName: 1,
                    email: 1,
                    studentId: 1,
                    createdAt: 1,
                    isTrash: 1,
                    enrolledCourses: { $ifNull: ["$enrolledCourses", []] }
                }
            },
            { $unwind: { path: "$enrolledCourses", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "courses",
                    localField: "enrolledCourses.courseId",
                    foreignField: "_id",
                    as: "courseDetails"
                }
            },
            { $unwind: { path: "$courseDetails", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "enrollments",
                    let: { sId: "$_id", cId: "$enrolledCourses.courseId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$studentId", "$$sId"] },
                                        { $eq: ["$courseId", "$$cId"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "paymentDetails"
                }
            },
            { $unwind: { path: "$paymentDetails", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    lastName: { $first: "$lastName" },
                    email: { $first: "$email" },
                    studentId: { $first: "$studentId" },
                    createdAt: { $first: "$createdAt" },
                    isTrash: { $first: "$isTrash" },
                    enrolledCourses: {
                        $push: {
                            $cond: [
                                { $gt: ["$enrolledCourses.courseId", null] },
                                {
                                    courseId: "$enrolledCourses.courseId",
                                    enrolledAt: "$enrolledCourses.enrolledAt",
                                    isCompleted: "$enrolledCourses.isCompleted",
                                    completedAt: "$enrolledCourses.completedAt",
                                    courseName: "$courseDetails.name",
                                    amountPaid: "$paymentDetails.amountPaid",
                                    paymentStatus: "$paymentDetails.paymentStatus"
                                },
                                "$$REMOVE"
                            ]
                        }
                    }
                }
            }
        ]);

        return student[0] || null;
    } catch (error) {
        throw error;
    }
};

const deleteStudent = async (id) => {
    try {
        const existing = await User.findById(id).select("isTrash");
        if (!existing) {
            return false;
        }
        if (existing.isTrash) {
            return -1;
        }

        const student = await User.updateOne({ _id: id }, { isTrash: true });
        if (student.modifiedCount === 0) {
            return false;
        }
        return true;
    } catch (error) {
        throw error;
    }
};

const getStats = async () => {
    try {
        const timezone = config.timezone || "Asia/Kolkata";
        const now = moment.tz(timezone);
        const oneWeekAgo = now.clone().subtract(7, 'days').toDate();
        const twoWeeksAgo = now.clone().subtract(14, 'days').toDate();

        // Total Students Growth (including trashed as requested)
        const totalStudents = await User.countDocuments({});
        const totalStudentsThisWeek = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });

        // Active Students Growth (using isTrash: false instead of isActive)
        const activeStudents = await User.countDocuments({ isTrash: { $ne: true } });
        const activeStudentsThisWeek = await User.countDocuments({ isTrash: { $ne: true }, createdAt: { $gte: oneWeekAgo } });
        const activeStudentsLastWeek = await User.countDocuments({ isTrash: { $ne: true }, createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } });

        let activeStudentsGrowth = 0;
        if (activeStudentsLastWeek > 0) {
            activeStudentsGrowth = ((activeStudentsThisWeek - activeStudentsLastWeek) / activeStudentsLastWeek) * 100;
        } else if (activeStudentsThisWeek > 0) {
            activeStudentsGrowth = 100;
        }

        // Completions Growth
        const completionsAgg = await User.aggregate([
            { $match: { isTrash: false } },
            { $unwind: "$enrolledCourses" },
            { $match: { "enrolledCourses.isCompleted": true } },
            {
                $group: {
                    _id: null,
                    totalCompletions: { $sum: 1 },
                    thisWeekCompletions: {
                        $sum: {
                            $cond: [{ $gte: ["$enrolledCourses.completedAt", oneWeekAgo] }, 1, 0]
                        }
                    },
                    lastWeekCompletions: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$enrolledCourses.completedAt", twoWeeksAgo] },
                                        { $lt: ["$enrolledCourses.completedAt", oneWeekAgo] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    }
                }
            }
        ]);

        const completionsData = completionsAgg[0] || { totalCompletions: 0, thisWeekCompletions: 0, lastWeekCompletions: 0 };
        const completions = completionsData.totalCompletions;

        let completionsGrowth = 0;
        if (completionsData.lastWeekCompletions > 0) {
            completionsGrowth = ((completionsData.thisWeekCompletions - completionsData.lastWeekCompletions) / completionsData.lastWeekCompletions) * 100;
        } else if (completionsData.thisWeekCompletions > 0) {
            completionsGrowth = 100;
        }

        return {
            totalStudents,
            totalStudentsThisWeek,
            activeStudents,
            activeStudentsGrowth: Math.round(activeStudentsGrowth),
            completions,
            completionsGrowth: Math.round(completionsGrowth)
        };
    } catch (error) {
        throw error;
    }
};

export default {
    getUsersList,
    getStudentById,
    deleteStudent,
    getStats
};
