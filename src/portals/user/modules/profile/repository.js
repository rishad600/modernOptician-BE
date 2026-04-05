import User from '../../../../models/user.model.js';

const create = async (userData) => {
    try {
        return await User.create(userData);
    } catch (error) {
        throw error;
    }
};

const findByEmail = async (email) => {
    try {
        return await User.findOne({ email }).select('+password');
    } catch (error) {
        throw error;
    }
};

const findById = async (id) => {
    try {
        return await User.findById(id).select('-resetPasswordOtp -resetPasswordExpires -activeToken -__v');
    } catch (error) {
        throw error;
    }
};

const update = async (id, updateData) => {
    try {
        return await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
    } catch (error) {
        throw error;
    }
};

const remove = async (id) => {
    try {
        return await User.findByIdAndUpdate(id, { isTrash: true }, { new: true });
    } catch (error) {
        throw error;
    }
};

const findAll = async () => {
    try {
        return await User.find({ isTrash: false }, { __v: 0 });
    } catch (error) {
        throw error;
    }
};

const findByIdWithPassword = async (id) => {
    try {
        return await User.findById(id).select('+password');
    } catch (error) {
        throw error;
    }
};

const findByEmailWithOtp = async (email) => {
    try {
        return await User.findOne({ email }).select('+resetPasswordOtp +resetPasswordExpires');
    } catch (error) {
        throw error;
    }
};

const findByStudentId = async (studentId) => {
    try {
        return await User.findOne({ studentId });
    } catch (error) {
        throw error;
    }
};

export default {
    create,
    findByEmail,
    findById,
    update,
    remove,
    findAll,
    findByIdWithPassword,
    findByEmailWithOtp,
    findByStudentId,
};
