import Joi from 'joi';

const dashboardFilters = Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    category: Joi.string().valid("Optometry", "Retail Management", "Contact Lens", "Dispensing").optional(),
});

export default {
    dashboardFilters,
};
