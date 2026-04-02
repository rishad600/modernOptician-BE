const createBlogDTO = (data, adminId) => {
    return {
        title: data.title,
        content: data.content,
        author: data.author,
        thumbnail: data.thumbnail,
        tags: data.tags || [],
        contentType: data.contentType,
        excerpt: data.excerpt,
        publishDate: data.publishDate,
        aboutAuthor: data.aboutAuthor,
        status: data.status,
        createdBy: adminId,
    };
};

const updateBlogDTO = (data, adminId) => {
    return {
        title: data.title,
        content: data.content,
        author: data.author,
        thumbnail: data.thumbnail,
        tags: data.tags,
        contentType: data.contentType,
        excerpt: data.excerpt,
        publishDate: data.publishDate,
        aboutAuthor: data.aboutAuthor,
        status: data.status,
        updatedBy: adminId,
    };
};

const responseBlogDTO = (blog) => {
    // If it's a Mongoose document, convert to plain object
    const blogObj = blog.toObject ? blog.toObject() : blog;
    
    // Remove unwanted fields
    delete blogObj.updatedAt;
    delete blogObj.createdAt;
    delete blogObj.updatedBy;
    delete blogObj.createdBy;
    delete blogObj.isTrash;
    delete blogObj.__v;
    
    return blogObj;
};

export default {
    createBlogDTO,
    updateBlogDTO,
    responseBlogDTO,
};
