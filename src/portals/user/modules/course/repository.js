import Course from '../../../../models/course.model.js';

const findById = async (id) => {
    return await Course.findById(id);
};

const update = async (id, updateData) => {
    return await Course.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
};

const remove = async (id) => {
    return await Course.findByIdAndUpdate(id, { isTrash: true }, { new: true });
};

import Enrollment from '../../../../models/entrollment.js';

const findAll = async () => {
    return await Course.find({ isTrash: false });
};

const findAllEnrolled = async (studentId) => {
    const enrollments = await Enrollment.find({ studentId }).populate({
        path: 'courseId',
        match: { isTrash: false, isPublished: true }
    });

    // Filter out nulls in case a course was deleted/unpublished but enrollment exists
    return enrollments.map(e => e.courseId).filter(c => c !== null);
};

export default {
    findById,
    update,
    remove,
    findAll,
    findAllEnrolled,
};
