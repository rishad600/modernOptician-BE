import User from './user.model.js';

class UserRepository {
    async create(userData) {
        return await User.create(userData);
    }

    async findByEmail(email) {
        return await User.findOne({ email }).select('+password');
    }

    async findById(id) {
        return await User.findById(id);
    }

    async update(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
    }

    async delete(id) {
        return await User.findByIdAndUpdate(id, { isTrash: true }, { new: true });
    }

    async findAll() {
        return await User.find({ isTrash: false }, { __v: 0 });
    }
}

export default new UserRepository();
