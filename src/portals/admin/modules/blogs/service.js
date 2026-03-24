import blogRepository from './repository.js';

const createBlog = async (blogData) => {
    try {
        return await blogRepository.createBlog(blogData);
    } catch (error) {
        throw error;
    }
};

const getAllBlogs = async () => {
    try {
        return await blogRepository.getAllBlogs();
    } catch (error) {
        throw error;
    }
};

const getOneBlog = async (id) => {
    try {
        return await blogRepository.getOneBlog(id);
    } catch (error) {
        throw error;
    }
};

const updateBlog = async (id, blogData) => {
    try {
        return await blogRepository.updateBlog(id, blogData);
    } catch (error) {
        throw error;
    }
};

const deleteBlog = async (id) => {
    try {
        return await blogRepository.deleteBlog(id);
    } catch (error) {
        throw error;
    }
};

export default {
    createBlog,
    getAllBlogs,
    getOneBlog,
    updateBlog,
    deleteBlog,
};
