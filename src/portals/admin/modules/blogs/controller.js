import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';
import blogService from './service.js';
import blogDto from './dto.js';
import bunnyStorage from '../../../../utils/bunnyStorage.js';
import { parsePaging, buildPagedResult } from '../../../../utils/paging.js';

const create = asyncHandler(async (req, res) => {
    if (req.file) {
        req.body.thumbnail = await bunnyStorage.uploadFile(req.file.buffer, req.file.originalname, 'blogs');
    }
    const blogDTO = blogDto.createBlogDTO(req.body, req.admin._id);
    const blog = await blogService.createBlog(blogDTO);
    return res
        .status(201)
        .json(Response.success('Your article has been successfully saved.', blogDto.responseBlogDTO(blog), 201));
});

const getAll = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePaging(req.query);
    const { search = '', status = '' } = req.query;
    const { items, totalCount } = await blogService.getAllBlogs({ skip, limit, search, status });
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

const update = asyncHandler(async (req, res) => {
    if (req.file) {
        req.body.thumbnail = await bunnyStorage.uploadFile(req.file.buffer, req.file.originalname, 'blogs');
    }
    const updateDTO = blogDto.updateBlogDTO(req.body, req.admin._id);
    const blog = await blogService.updateBlog(req.params.id, updateDTO);
    if (!blog) {
        return res.status(404).json(Response.error('The requested article could not be found.', 404));
    }
    return res
        .status(200)
        .json(Response.success('Your article has been successfully updated.', blogDto.responseBlogDTO(blog), 200));
});

const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.deleteBlog(req.params.id);
    if (!blog) {
        return res.status(404).json(Response.error('Blog not found', 404));
    }
    return res.status(200).json(Response.success('Blog deleted successfully', blog, 200));
});

export default {
    create,
    getAll,
    getOne,
    update,
    deleteBlog,
};
