import courseModel from '../../../../models/course.model.js';

const createCourse = async (courseData) => {
    try {
        const course = await courseModel.create(courseData);
        const result = course.toObject();
        delete result.__v;
        delete result.updatedBy;
        delete result.createdBy;
        delete result.createdAt;
        delete result.updatedAt;
        return result;
    } catch (err) {
        throw err;
    }
};

const getAllCourses = async () => {
    try {
        const courses = await courseModel.find();
        return courses;
    } catch (err) {
        throw err;
    }
};

const getOneCourse = async (id) => {
    try {
        const course = await courseModel.findById(id);
        return course;
    } catch (err) {
        throw err;
    }
};

const updateCourse = async (id, courseData) => {
    try {
        const course = await courseModel.updateOne({ _id: id }, courseData);
        if (course.matchedCount === 0) {
            return false;
        }
        return true;
    } catch (err) {
        throw err;
    }
};

const deleteCourse = async (id) => {
    try {
        const existing = await courseModel.findById(id).select("isTrash");
        if (!existing) {
            return false;
        }
        if (existing.isTrash) {
            return -1;
        }

        const course = await courseModel.updateOne({ _id: id }, { isTrash: true });
        if (course.modifiedCount === 0) {
            return false;
        }
        return true;
    } catch (err) {
        throw err;
    }
};

export default {
    createCourse,
    getAllCourses,
    getOneCourse,
    updateCourse,
    deleteCourse,
};
