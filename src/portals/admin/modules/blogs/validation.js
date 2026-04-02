import Joi from 'joi';

const createBlog = Joi.object({
    title: Joi.string().trim().required().messages({
        'string.empty': 'Blog title is required',
    }),
    content: Joi.string().required().messages({
        'string.empty': 'Blog content is required',
    }),
    author: Joi.string().required().messages({
        'string.empty': 'Author is required',
    }),
    thumbnail: Joi.string().required().messages({
        'string.empty': 'Thumbnail is required',
    }),
    tags: Joi.array().items(Joi.string()).required(),
    contentType: Joi.string().valid('Blog Post', 'Article').required(),
    excerpt: Joi.string().allow('').required(),
    publishDate: Joi.string().allow(null, '').required(),
    aboutAuthor: Joi.string().allow('').required(),
    status: Joi.string().valid('Published', 'Draft').required(),
});

const updateBlog = Joi.object({
    title: Joi.string().trim().required().messages({
        'string.empty': 'Blog title is required',
    }),
    content: Joi.string().required().messages({
        'string.empty': 'Blog content is required',
    }),
    author: Joi.string().required().messages({
        'string.empty': 'Author is required',
    }),
    thumbnail: Joi.string().required().messages({
        'string.empty': 'Thumbnail is required',
    }),
    tags: Joi.array().items(Joi.string()).required(),
    contentType: Joi.string().valid('Blog Post', 'Article').required(),
    excerpt: Joi.string().allow('').required(),
    publishDate: Joi.string().allow(null, '').required(),
    aboutAuthor: Joi.string().allow('').required(),
    status: Joi.string().valid('Published', 'Draft').required(),
});

export default {
    createBlog,
    updateBlog,
};
