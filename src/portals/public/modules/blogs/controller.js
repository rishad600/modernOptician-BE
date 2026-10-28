import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';
import blogService from './service.js';
import { parsePaging, buildPagedResult } from '../../../../utils/paging.js';

const getAll = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePaging(req.query);
    const { search = '' } = req.query;
    const { items, totalCount } = await blogService.getAllBlogs({ skip, limit, search });
    return res
        .status(200)
        .json(Response.success('Blogs fetched successfully', buildPagedResult(items, totalCount, page, limit, 'blogs'), 200));
});

const getOne = asyncHandler(async (req, res) => {
    const blog = await blogService.getOneBlog(req.params.id);
    if (!blog) {
        return res.status(404).json(Response.error('Blog not found', 404));
    }
    return res.status(200).json(Response.success('Blog fetched successfully', blog, 200));
});

export default {
    getAll,
    getOne,
};
