import Joi from 'joi';

const courseIdParam = {
    params: Joi.object({
        id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
            'string.pattern.base': 'Invalid course ID format'
        }),
    }),
};

const lessonIdParam = {
    params: Joi.object({
        lessonId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
            'string.pattern.base': 'Invalid lesson ID format'
        }),
    }),
};

export default {
    courseIdParam,
    lessonIdParam,
};
