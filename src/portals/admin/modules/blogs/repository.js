import blogModel from '../../../../models/blog.model.js';

const createBlog = async (blogData) => {
    try {
        const blog = await blogModel.create(blogData);
        return blog;
    } catch (err) {
        throw err;
    }
};

const getAllBlogs = async () => {
    try {
        const blogs = await blogModel.find({ isTrash: false });
        return blogs;
    } catch (err) {
        throw err;
    }
};

const getOneBlog = async (id) => {
    try {
        const blog = await blogModel.findOne({ _id: id, isTrash: false });
        return blog;
    } catch (err) {
        throw err;
    }
};

const updateBlog = async (id, blogData) => {
    try {
        const blog = await blogModel.findOneAndUpdate({ _id: id, isTrash: false }, blogData, { new: true });
        return blog;
    } catch (err) {
        throw err;
    }
};

const deleteBlog = async (id) => {
    try {
        const blog = await blogModel.findByIdAndUpdate(id, { isTrash: true }, { new: true });
        return blog;
    } catch (err) {
        throw err;
    }
};

export default {
    createBlog,
    getAllBlogs,
    getOneBlog,
    updateBlog,
    deleteBlog,
};
