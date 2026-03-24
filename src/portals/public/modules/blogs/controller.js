import Response from '../../../../utils/response.js';
import blogService from './service.js';

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

export default {
    getAll,
    getOne,
};
