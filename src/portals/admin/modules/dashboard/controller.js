import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';
import dashboardService from './service.js';
import dashboardDto from './dto.js';

const getDashboard = asyncHandler(async (req, res) => {
    const filters = dashboardDto.dashboardDTO(req.query);
    const dashboardData = await dashboardService.getDashboardData(filters);
    return res.status(200).json(Response.success('Dashboard data fetched successfully', dashboardData, 200));
});

export default {
    getDashboard,
};
