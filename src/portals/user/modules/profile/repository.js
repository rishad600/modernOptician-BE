import User from '../../../../models/user.model.js';

const create = async (userData) => User.create(userData);

const findByEmail = async (email) => User.findOne({ email }).select('+password');

const findById = async (id) =>
    User.findById(id).select('-resetPasswordOtp -resetPasswordExpires -activeToken -__v');

const update = async (id, updateData) =>
    User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

const remove = async (id) => User.findByIdAndUpdate(id, { isTrash: true }, { new: true });

const findAll = async () => User.find({ isTrash: false }, { __v: 0 });

const findByIdWithPassword = async (id) => User.findById(id).select('+password');

const findByEmailWithOtp = async (email) =>
    User.findOne({ email }).select('+resetPasswordOtp +resetPasswordExpires');

const findByStudentId = async (studentId) => User.findOne({ studentId });

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
