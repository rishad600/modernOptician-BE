import Course from './course.model.js';

class CourseRepository {
    async create(courseData) {
        return await Course.create(courseData);
    }

    async findById(id) {
        return await Course.findById(id);
    }

    async update(id, updateData) {
        return await Course.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
    }

    async delete(id) {
        return await Course.findByIdAndUpdate(id, { isTrash: true }, { new: true });
    }

    async findAll() {
        return await Course.find({ isTrash: false });
    }
}

export default new CourseRepository();
