import blogModel from '../../../../models/blog.model.js';

const createBlog = async (blogData) => blogModel.create(blogData);

const getAllBlogs = async ({ skip = 0, limit = 20, search = '', status = '' } = {}) => {
    const filter = { isTrash: false };
    if (status) filter.status = status;
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
        ];
    }
    const [items, totalCount] = await Promise.all([
        blogModel.find(filter).sort({ publishDate: -1 }).skip(skip).limit(limit).lean(),
        blogModel.countDocuments(filter),
    ]);
    return { items, totalCount };
};

const getOneBlog = async (id) => blogModel.findOne({ _id: id, isTrash: false });

const updateBlog = async (id, blogData) =>
    blogModel.findOneAndUpdate({ _id: id, isTrash: false }, blogData, { new: true });

const deleteBlog = async (id) =>
    blogModel.findByIdAndUpdate(id, { isTrash: true }, { new: true });

export default {
    createBlog,
    getAllBlogs,
    getOneBlog,
    updateBlog,
    deleteBlog,
};
