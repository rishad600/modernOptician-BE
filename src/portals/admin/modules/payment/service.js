import paymentRepository from "./repository.js";
import dto from "./dto.js";

const getStats = async () => {
    try {
        const stats = await paymentRepository.getStats();

        const calculateGrowth = (current, last) => {
            if (last === 0) return current > 0 ? 100 : 0;
            return ((current - last) / last) * 100;
        };

        return {
            revenue: {
                total: stats.revenue.total,
                growthPercentage: Math.round(calculateGrowth(stats.revenue.total, stats.revenue.lastMonth))
            },
            successPayment: {
                total: stats.success.total,
                growthPercentage: Math.round(calculateGrowth(stats.success.total, stats.success.lastMonth))
            },
            pendingPayment: {
                total: stats.pending.total,
                todaysPending: stats.pending.newToday
            }
        };
    } catch (error) {
        throw error;
    }
};

const getList = async (search, status, page, limit) => {
    try {
        const { payments, totalCount, nextPage } = await paymentRepository.getList(search, status, page, limit);
        return {
            payments: dto.formatPaymentList(payments),
            totalCount,
            nextPage
        };
    } catch (error) {
        throw error;
    }
};

export default {
    getStats,
    getList
};
