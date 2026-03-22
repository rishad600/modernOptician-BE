import courseRepository from './repository.js';

const getAllCourses = async (studentId) => {
    return await courseRepository.findAllEnrolled(studentId);
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
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
};
