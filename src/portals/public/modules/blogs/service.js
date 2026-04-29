import blogRepository from './repository.js';

const getAllBlogs = async (paging) => blogRepository.getAllBlogs(paging);
const getOneBlog = async (id) => blogRepository.getOneBlog(id);

export default {
    getAllBlogs,
    getOneBlog,
};
