import Joi from 'joi';

const createCourse = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Please add a course name',
        'any.required': 'Please add a course name'
    }),
    description: Joi.string().optional(),
    thumbnail: Joi.string().uri().optional(),
    price: Joi.number().min(0).required(),
    currency: Joi.string().default('USD').optional(),
    isTrash: Joi.boolean().default(false).optional(),
    category: Joi.string().valid("Optometry", "Retail Management", "Contact Lens", "Dispensing").required(),
    features: Joi.array().items(Joi.string()).default([]).optional(),
    totalDuration: Joi.number().min(0).default(0).optional(),
    isPublished: Joi.boolean().default(false).optional()
    // createdBy will be assigned via token/auth, not user input
});

const updateCourse = Joi.object({
    name: Joi.string().trim().optional(),
    description: Joi.string().optional(),
    thumbnail: Joi.string().uri().optional(),
    price: Joi.number().min(0).optional(),
    currency: Joi.string().optional(),
    isTrash: Joi.boolean().optional(),
    category: Joi.string().valid("Optometry", "Retail Management", "Contact Lens", "Dispensing").optional(),
    features: Joi.array().items(Joi.string()).optional(),
    totalDuration: Joi.number().min(0).optional(),
    isPublished: Joi.boolean().optional()
    // updatedBy will be assigned via token/auth, not user input
});

export default {
    createCourse,
    updateCourse,
};
