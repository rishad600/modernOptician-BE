import Joi from 'joi';

const createCourse = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Please add a course name',
        'any.required': 'Please add a course name'
    }),
    description: Joi.string().required(),
    thumbnail: Joi.string().uri().required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().valid("Optometry", "Retail Management", "Contact Lens", "Dispensing").required(),
    features: Joi.array().items(Joi.string()).default([]).optional(),
    instructorName: Joi.string().required(),
    status: Joi.string().valid('Published', 'Draft', 'Archived').default('Draft').required()
    // createdBy will be assigned via token/auth, not user input
});

const updateCourse = Joi.object({
    name: Joi.string().trim().optional(),
    description: Joi.string().optional(),
    thumbnail: Joi.string().uri().optional(),
    price: Joi.number().min(0).optional(),
    category: Joi.string().valid("Optometry", "Retail Management", "Contact Lens", "Dispensing").optional(),
    features: Joi.array().items(Joi.string()).optional(),
    instructorName: Joi.string().optional(),
    status: Joi.string().valid('Published', 'Draft', 'Archived').optional()
    // updatedBy will be assigned via token/auth, not user input
});

export default {
    createCourse,
    updateCourse,
};
