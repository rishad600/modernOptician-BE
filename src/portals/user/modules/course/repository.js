import mongoose from 'mongoose';
import Course from '../../../../models/course.model.js';
import Enrollment from '../../../../models/enrollment.model.js';

// Helper: list of courseIds the student is enrolled in (completed payments only).
// Why: User.enrolledCourses was removed; Enrollment is the source of truth.
const getEnrolledCourseIds = async (studentId) => {
    const ids = await Enrollment.find(
        { studentId, paymentStatus: 'completed' },
        { courseId: 1, _id: 0 }
    ).lean();
    return ids.map((e) => e.courseId);
};

const findById = async (id, studentId) => {
    const enrolledCourseIds = await getEnrolledCourseIds(studentId);
    const enrolledStrIds = enrolledCourseIds.map((cid) => cid.toString());

    const result = await Course.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
                isTrash: false,
                status: 'Published',
            },
        },
        {
            $addFields: {
                isEnrolled: { $in: [{ $toString: '$_id' }, enrolledStrIds] },
            },
        },
        {
            $lookup: {
                from: 'lessons',
                localField: '_id',
                foreignField: 'courseId',
                as: 'lessonsArray',
            },
        },
        {
            $addFields: {
                lessonsArray: {
                    $map: {
                        input: { $sortArray: { input: '$lessonsArray', sortBy: { order: 1 } } },
                        as: 'lesson',
                        in: {
                            _id: '$$lesson._id',
                            title: '$$lesson.title',
                            description: '$$lesson.description',
                            videoStatus: '$$lesson.videoStatus',
                            duration: '$$lesson.duration',
                            isFreePreview: '$$lesson.isFreePreview',
                            // Only return bunnyVideoId if enrolled or it's a free preview.
                            bunnyVideoId: {
                                $cond: [
                                    { $or: ['$isEnrolled', { $eq: ['$$lesson.isFreePreview', true] }] },
                                    '$$lesson.bunnyVideoId',
                                    null,
                                ],
                            },
                            isPublished: {
                                $cond: [
                                    { $or: ['$isEnrolled', { $eq: ['$$lesson.isFreePreview', true] }] },
                                    '$$lesson.isPublished',
                                    false,
                                ],
                            },
                        },
                    },
                },
            },
        },
        {
            $project: {
                __v: 0,
                updatedBy: 0,
                createdBy: 0,
                createdAt: 0,
                updatedAt: 0,
            },
        },
    ]);
    return result[0] || null;
};

const update = async (id, updateData) =>
    Course.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

const remove = async (id) => Course.findByIdAndUpdate(id, { isTrash: true }, { new: true });

const findAllCourses = async (studentId, { skip = 0, limit = 20 } = {}) => {
    const enrolledCourseIds = await getEnrolledCourseIds(studentId);
    const enrolledStrIds = enrolledCourseIds.map((cid) => cid.toString());

    const [courses, totalCount] = await Promise.all([
        Course.aggregate([
            { $match: { isTrash: false, status: 'Published' } },
            {
                $addFields: {
                    isEnrolled: { $in: [{ $toString: '$_id' }, enrolledStrIds] },
                },
            },
            { $project: { __v: 0, updatedBy: 0, createdBy: 0, updatedAt: 0 } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]),
        Course.countDocuments({ isTrash: false, status: 'Published' }),
    ]);

    return { courses, totalCount };
};

const findEnrolledCoursesOnly = async (studentId, { skip = 0, limit = 20 } = {}) => {
    const enrolledCourseIds = await getEnrolledCourseIds(studentId);
    if (enrolledCourseIds.length === 0) {
        return { courses: [], totalCount: 0 };
    }

    const baseMatch = {
        _id: { $in: enrolledCourseIds },
        isTrash: false,
        status: 'Published',
    };

    const [courses, totalCount] = await Promise.all([
        Course.aggregate([
            { $match: baseMatch },
            { $addFields: { isEnrolled: true } },
            { $project: { __v: 0, updatedBy: 0, createdBy: 0, updatedAt: 0 } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]),
        Course.countDocuments(baseMatch),
    ]);

    return { courses, totalCount };
};

const enrollStudent = async (studentId, courseId) => {
    const course = await Course.findOne({ _id: courseId, isTrash: false, status: 'Published' });
    if (!course) return -1;

    try {
        const enrollment = await Enrollment.create({
            studentId,
            courseId,
            amountPaid: course.price,
            paymentStatus: 'completed',
            paymentMethod: 'N/A',
        });
        return enrollment;
    } catch (err) {
        // Unique (studentId, courseId) index — already enrolled.
        if (err.code === 11000) return -2;
        throw err;
    }
};

export default {
    findById,
    update,
    remove,
    findAllCourses,
    findEnrolledCoursesOnly,
    enrollStudent,
};
