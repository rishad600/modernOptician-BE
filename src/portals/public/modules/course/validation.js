import Joi from 'joi';

const getOne = {
    params: Joi.object({
        id: Joi.string().min(4).required(),
    }),
};

const playVideo = {
    params: Joi.object({
        lessonId: Joi.string().min(4).required(),
    }),
};

export default {
    getOne,
    playVideo,
};
