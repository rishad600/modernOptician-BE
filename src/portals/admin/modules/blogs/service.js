import blogRepository from './repository.js';

const createBlog = async (blogData) => blogRepository.createBlog(blogData);
const getAllBlogs = async (paging) => blogRepository.getAllBlogs(paging);
const getOneBlog = async (id) => blogRepository.getOneBlog(id);
const updateBlog = async (id, blogData) => blogRepository.updateBlog(id, blogData);
const deleteBlog = async (id) => blogRepository.deleteBlog(id);

export default {
    createBlog,
    getAllBlogs,
    getOneBlog,
    updateBlog,
    deleteBlog,
};
