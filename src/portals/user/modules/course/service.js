import courseRepository from './repository.js';

const createCourse = async (courseData) => {
    return await courseRepository.create(courseData);
};

const getAllCourses = async () => {
    return await courseRepository.findAll();
};

const getCourseById = async (id) => {
    return await courseRepository.findById(id);
};

const updateCourse = async (id, updateData) => {
    return await courseRepository.update(id, updateData);
};

const deleteCourse = async (id) => {
    return await courseRepository.remove(id); // Changed to 'remove' to match new repository
};

export default {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
};
