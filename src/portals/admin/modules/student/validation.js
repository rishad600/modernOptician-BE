import Joi from 'joi';

const getUsersList = {
    query: Joi.object().keys({
        search: Joi.string().allow('').optional(),
        status: Joi.string().valid('Active', 'Inactive', '').optional(),
        page: Joi.number().integer().min(1).default(1).optional(),
        limit: Joi.number().integer().min(1).default(20).optional(),
    })
};

export default {
    getUsersList,
};
