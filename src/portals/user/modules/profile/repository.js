import User from '../../../../models/user.model.js';

export const makeUserRepository = ({ User }) => {
    const create = async (userData) => {
        return await User.create(userData);
    };

    const findByEmail = async (email) => {
        return await User.findOne({ email }).select('+password');
    };

    const findById = async (id) => {
        return await User.findById(id);
    };

    const update = async (id, updateData) => {
        return await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
    };

    const remove = async (id) => {
        return await User.findByIdAndUpdate(id, { isTrash: true }, { new: true });
    };

    const findAll = async () => {
        return await User.find({ isTrash: false }, { __v: 0 });
    };

    return Object.freeze({
        create,
        findByEmail,
        findById,
        update,
        remove,
        findAll,
    });
};
