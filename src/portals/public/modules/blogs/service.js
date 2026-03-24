import blogRepository from './repository.js';

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

export default {
    getAllBlogs,
    getOneBlog,
};
