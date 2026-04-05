import Joi from 'joi';

const getList = {
    query: Joi.object().keys({
        search: Joi.string().allow('').optional(),
        status: Joi.string().valid('pending', 'completed', 'failed', 'refunded', '').optional(),
        page: Joi.number().integer().min(1).default(1).optional(),
        limit: Joi.number().integer().min(1).default(20).optional(),
    })
};

export default {
    getList,
};
