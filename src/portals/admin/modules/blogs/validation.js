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
    thumbnail: Joi.string().uri().required().messages({
        'string.uri': 'Thumbnail must be a valid URL',
        'string.empty': 'Thumbnail is required',
    }),
    quote: Joi.string().allow('').optional(),
    category: Joi.array().items(Joi.string()).optional(),
    isPublished: Joi.boolean().optional(),
});

const updateBlog = Joi.object({
    title: Joi.string().trim().optional(),
    content: Joi.string().optional(),
    author: Joi.string().optional(),
    thumbnail: Joi.string().uri().optional(),
    quote: Joi.string().allow('').optional(),
    category: Joi.array().items(Joi.string()).optional(),
    isPublished: Joi.boolean().optional(),
});

export default {
    createBlog,
    updateBlog,
};
