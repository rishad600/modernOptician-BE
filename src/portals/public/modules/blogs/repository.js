import blogModel from '../../../../models/blog.model.js';

const getAllBlogs = async ({ skip = 0, limit = 20, search = '' } = {}) => {
    const filter = { status: 'Published', isTrash: false };
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

const getOneBlog = async (id) =>
    blogModel.findOne({ _id: id, status: 'Published', isTrash: false }).lean();

export default {
    getAllBlogs,
    getOneBlog,
};
