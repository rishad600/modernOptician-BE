export const makeAdminRepository = ({ Admin }) => {
    const create = async (adminData) => {
        return await Admin.create(adminData);
    };

    const findByEmail = async (email) => {
        return await Admin.findOne({ email }).select('+password');
    };

    return Object.freeze({
        create,
        findByEmail,
    });
};
