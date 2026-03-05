import Response from '../../../../utils/response.js';
import dashboardService from './service.js';
import dashboardDto from './dto.js';

const getDashboard = async (req, res, next) => {
    try {
        const filters = dashboardDto.dashboardDTO(req.query);
        const dashboardData = await dashboardService.getDashboardData(filters);
        return res.status(200).json(Response.success('Dashboard data fetched successfully', dashboardData, 200));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to fetch dashboard data', 500));
    }
};

export default {
    getDashboard,
};
