const createBlogDTO = (data, adminId) => {
    return {
        title: data.title,
        content: data.content,
        author: data.author,
        thumbnail: data.thumbnail,
        quote: data.quote || '',
        category: data.category || [],
        isPublished: data.isPublished || false,
        createdBy: adminId,
    };
};

const updateBlogDTO = (data, adminId) => {
    return {
        title: data.title,
        content: data.content,
        author: data.author,
        thumbnail: data.thumbnail,
        quote: data.quote,
        category: data.category,
        isPublished: data.isPublished,
        updatedBy: adminId,
    };
};

export default {
    createBlogDTO,
    updateBlogDTO,
};
