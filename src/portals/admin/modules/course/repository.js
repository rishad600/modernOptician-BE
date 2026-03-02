import courseModel from '../../../../models/course.model.js';

const createCourse = async (courseData) => {
    try {
        const course = await courseModel.create(courseData);
        return course;
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
        const course = await courseModel.findByIdAndUpdate(id, courseData, { new: true });
        return course;
    } catch (err) {
        throw err;
    }
};

const deleteCourse = async (id) => {
    try {
        const course = await courseModel.findByIdAndUpdate(id, { isTrash: true }, { new: true });
        return course;
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
