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
    thumbnail: Joi.string().optional().allow(''),
    tags: Joi.array().items(Joi.string()).required(),
    contentType: Joi.string().valid('Blog Post', 'Article').required(),
    excerpt: Joi.string().allow('').required(),
    publishDate: Joi.string().allow(null, '').required(),
    aboutAuthor: Joi.string().allow('').required(),
    status: Joi.string().valid('Published', 'Draft').required(),
});

const updateBlog = Joi.object({
    title: Joi.string().trim().optional(),
    content: Joi.string().optional(),
    author: Joi.string().optional(),
    thumbnail: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    contentType: Joi.string().valid('Blog Post', 'Article').optional(),
    excerpt: Joi.string().allow('').optional(),
    publishDate: Joi.string().allow(null, '').optional(),
    aboutAuthor: Joi.string().allow('').optional(),
    status: Joi.string().valid('Published', 'Draft').optional(),
});

export default {
    createBlog,
    updateBlog,
};
