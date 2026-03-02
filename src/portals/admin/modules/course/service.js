import courseRepository from './repository.js';

const createCourse = async (courseData) => {
    try {
        const course = await courseRepository.createCourse(courseData);
        return course;
    } catch (error) {
        throw error;
    }
};

const getAllCourses = async () => {
    try {
        const courses = await courseRepository.getAllCourses();
        return courses;
    } catch (error) {
        throw error;
    }
};

const getOneCourse = async (id) => {
    try {
        const course = await courseRepository.getOneCourse(id);
        return course;
    } catch (error) {
        throw error;
    }
};

const updateCourse = async (id, courseData) => {
    try {
        const course = await courseRepository.updateCourse(id, courseData);
        return course;
    } catch (error) {
        throw error;
    }
};

const deleteCourse = async (id) => {
    try {
        const course = await courseRepository.deleteCourse(id);
        return course;
    } catch (error) {
        throw error;
    }
};

export default {
    createCourse,
    getAllCourses,
    getOneCourse,
    updateCourse,
    deleteCourse,
};
