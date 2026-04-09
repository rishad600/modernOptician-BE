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

const prepareVideoUpload = Joi.object({
    courseId: Joi.string().required(),
    lessonId: Joi.string().required(),
});

const createLesson = Joi.object({
    courseId: Joi.string().required(),
    title: Joi.string().trim().required(),
    description: Joi.string().required(),
    order: Joi.number().required(),
    isFreePreview: Joi.boolean().default(false),
    duration: Joi.number().default(0),
});

const playVideo = Joi.object({
    params: Joi.object({
        lessonId: Joi.string().required(),
    }),
});

export default {
    createCourse,
    updateCourse,
    prepareVideoUpload,
    createLesson,
    playVideo,
};
