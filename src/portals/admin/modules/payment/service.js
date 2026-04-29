import paymentRepository from "./repository.js";
import dto from "./dto.js";

const calculateGrowth = (current, last) => {
    if (last === 0) return current > 0 ? 100 : 0;
    return ((current - last) / last) * 100;
};

const getStats = async () => {
    const stats = await paymentRepository.getStats();
    return {
        revenue: {
            total: stats.revenue.total,
            growthPercentage: Math.round(calculateGrowth(stats.revenue.total, stats.revenue.lastMonth)),
        },
        successPayment: {
            total: stats.success.total,
            growthPercentage: Math.round(calculateGrowth(stats.success.total, stats.success.lastMonth)),
        },
        pendingPayment: {
            total: stats.pending.total,
            todaysPending: stats.pending.newToday,
        },
    };
};

const getList = async (search, status, page, limit) => {
    const { payments, totalCount, nextPage } = await paymentRepository.getList(search, status, page, limit);
    return {
        payments: dto.formatPaymentList(payments),
        totalCount,
        nextPage,
    };
};

export default {
    getStats,
    getList,
};
