import Admin from '../../../../models/admin.model.js';

const create = async (adminData) => {
    return await Admin.create(adminData);
};

const findByEmail = async (email) => {
    return await Admin.findOne({ email }).select('+password');
};

export default {
    create,
    findByEmail,
};
