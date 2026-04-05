import paymentService from "./service.js";
import asyncHandler from "../../../../utils/asyncHandler.js";
import Response from "../../../../utils/response.js";

const getStats = asyncHandler(async (req, res, next) => {
    try {
        const stats = await paymentService.getStats();
        return res.json(Response.success("Payment statistics fetched successfully", stats));
    } catch (error) {
        return res.status(500).json(Response.error("An error occurred while fetching the payment statistics. Please try again later.", 500));
    }
});

const getList = asyncHandler(async (req, res, next) => {
    try {
        const { search = '', status = '' } = req.query;
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 20;

        if (page < 1) page = 1;
        if (limit < 1) limit = 20;

        const result = await paymentService.getList(search, status, page, limit);
        return res.json(Response.success("Payment list fetched successfully", result));
    } catch (error) {
        return res.status(500).json(Response.error("An error occurred while fetching the payment list. Please try again later.", 500));
    }
});

export default {
    getStats,
    getList
};
