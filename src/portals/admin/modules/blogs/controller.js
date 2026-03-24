import Response from '../../../../utils/response.js';
import blogService from './service.js';
import blogDto from './dto.js';

const create = async (req, res, next) => {
    try {
        const blogDTO = blogDto.createBlogDTO(req.body, req.admin._id);

        const blog = await blogService.createBlog(blogDTO);
        return res.status(201).json(Response.success('Blog created successfully', blog, 201));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to create blog', 500));
    }
};

const getAll = async (req, res, next) => {
    try {
        const blogs = await blogService.getAllBlogs();
        return res.status(200).json(Response.success('Blogs fetched successfully', blogs, 200));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to fetch blogs', 500));
    }
};

const getOne = async (req, res, next) => {
    try {
        const blog = await blogService.getOneBlog(req.params.id);
        if (!blog) {
            return res.status(404).json(Response.error('Blog not found', 404));
        }
        return res.status(200).json(Response.success('Blog fetched successfully', blog, 200));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to fetch blog', 500));
    }
};

const update = async (req, res, next) => {
    try {
        const updateDTO = blogDto.updateBlogDTO(req.body, req.admin._id);
        const blog = await blogService.updateBlog(req.params.id, updateDTO);
        if (!blog) {
            return res.status(404).json(Response.error('Blog not found', 404));
        }
        return res.status(200).json(Response.success('Blog updated successfully', blog, 200));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to update blog', 500));
    }
};

const deleteBlog = async (req, res, next) => {
    try {
        const blog = await blogService.deleteBlog(req.params.id);
        if (!blog) {
            return res.status(404).json(Response.error('Blog not found', 404));
        }
        return res.status(200).json(Response.success('Blog deleted successfully', blog, 200));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to delete blog', 500));
    }
};

export default {
    create,
    getAll,
    getOne,
    update,
    deleteBlog,
};
