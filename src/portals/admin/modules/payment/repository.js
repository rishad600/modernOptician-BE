import Enrollment from "../../../../models/entrollment.js";
import moment from "moment-timezone";
import config from "../../../../config/config.js";

const getStats = async () => {
    try {
        const timezone = config.timezone;
        const now = moment.tz(timezone);
        const startOfCurrentMonth = now.clone().startOf('month').toDate();
        const startOfLastMonth = now.clone().subtract(1, 'month').startOf('month').toDate();
        const endOfLastMonth = now.clone().subtract(1, 'month').endOf('month').toDate();
        const startOfToday = now.clone().startOf('day').toDate();

        // Revenue & Success counts for MoM
        const stats = await Enrollment.aggregate([
            {
                $facet: {
                    currentMonth: [
                        { $match: { enrolledAt: { $gte: startOfCurrentMonth }, paymentStatus: 'completed' } },
                        { $group: { _id: null, revenue: { $sum: "$amountPaid" }, count: { $sum: 1 } } }
                    ],
                    lastMonth: [
                        { $match: { enrolledAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: 'completed' } },
                        { $group: { _id: null, revenue: { $sum: "$amountPaid" }, count: { $sum: 1 } } }
                    ],
                    pendingIssues: [
                        { $match: { paymentStatus: 'pending' } },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                newToday: {
                                    $sum: {
                                        $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const current = stats[0].currentMonth[0] || { revenue: 0, count: 0 };
        const last = stats[0].lastMonth[0] || { revenue: 0, count: 0 };
        const pending = stats[0].pendingIssues[0] || { total: 0, newToday: 0 };

        return {
            revenue: {
                total: current.revenue,
                lastMonth: last.revenue
            },
            success: {
                total: current.count,
                lastMonth: last.count
            },
            pending: {
                total: pending.total,
                newToday: pending.newToday
            }
        };
    } catch (error) {
        throw error;
    }
};

const getList = async (search, status, page = 1, limit = 20) => {
    try {
        const skip = (page - 1) * limit;
        let matchCondition = {};

        if (status) {
            matchCondition.paymentStatus = status;
        }

        const aggregation = [
            { $match: matchCondition },
            {
                $lookup: {
                    from: "users",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student"
                }
            },
            { $unwind: "$student" },
            {
                $lookup: {
                    from: "courses",
                    localField: "courseId",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $unwind: "$course" }
        ];

        if (search) {
            aggregation.push({
                $addFields: {
                    studentFullName: {
                        $concat: ["$student.name", " ", { $ifNull: ["$student.lastName", ""] }]
                    }
                }
            });

            aggregation.push({
                $match: {
                    $or: [
                        { studentFullName: { $regex: search, $options: "i" } },
                        { paymentId: { $regex: search, $options: "i" } }
                    ]
                }
            });
        }

        aggregation.push(
            { $sort: { enrolledAt: -1 } },
            {
                $facet: {
                    payments: [{ $skip: skip }, { $limit: Number(limit) }],
                    totalCount: [{ $count: "count" }]
                }
            }
        );

        const result = await Enrollment.aggregate(aggregation);
        const payments = result[0].payments;
        const totalCount = result[0].totalCount[0]?.count || 0;
        const nextPage = totalCount > (limit * page) ? page + 1 : -1;

        return { payments, totalCount, nextPage };
    } catch (error) {
        throw error;
    }
};

export default {
    getStats,
    getList
};
