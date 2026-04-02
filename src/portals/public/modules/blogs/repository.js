import blogModel from '../../../../models/blog.model.js';

const getAllBlogs = async () => {
    try {
        const blogs = await blogModel.find({ status: 'Published', isTrash: false });
        return blogs;
    } catch (err) {
        throw err;
    }
};

const getOneBlog = async (id) => {
    try {
        const blog = await blogModel.findOne({ _id: id, status: 'Published', isTrash: false });
        return blog;
    } catch (err) {
        throw err;
    }
};

export default {
    getAllBlogs,
    getOneBlog,
};
