import mongoose from 'mongoose';
import Course from '../../../../models/course.model.js';

const findById = async (id, studentId) => {
    try {
        const user = await User.findById(studentId).select('enrolledCourses').lean();
        const enrolledCourseIds = user?.enrolledCourses?.map(c => c.courseId.toString()) || [];

        const result = await Course.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    isTrash: false,
                    status: 'Published'
                }
            },
            {
                $addFields: {
                    isEnrolled: { $in: [{ $toString: "$_id" }, enrolledCourseIds] }
                }
            },
            {
                $lookup: {
                    from: 'lessons',
                    localField: '_id',
                    foreignField: 'courseId',
                    as: 'lessonsArray'
                }
            },
            {
                $addFields: {
                    lessonsArray: {
                        $map: {
                            input: {
                                $sortArray: { input: "$lessonsArray", sortBy: { order: 1 } }
                            },
                            as: "lesson",
                            in: {
                                _id: "$$lesson._id",
                                title: "$$lesson.title",
                                description: "$$lesson.description",
                                videoStatus: "$$lesson.videoStatus",
                                duration: "$$lesson.duration",
                                isFreePreview: "$$lesson.isFreePreview",
                                isPublished: "$$lesson.isPublished",
                                // Only return bunnyVideoId if enrolled or it's a free preview
                                bunnyVideoId: {
                                    $cond: [
                                        { $or: ["$isEnrolled", { $eq: ["$$lesson.isFreePreview", true] }] },
                                        "$$lesson.bunnyVideoId",
                                        null
                                    ]
                                },
                                isTrashed: "$$lesson.isTrashed"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    __v: 0,
                    updatedBy: 0,
                    createdBy: 0,
                    createdAt: 0,
                    updatedAt: 0,
                }
            }
        ]);
        return result[0] || null;
    } catch (error) {
        throw error;
    }
};

const update = async (id, updateData) => {
    try {
        return await Course.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
    } catch (error) {
        throw error;
    }
};

const remove = async (id) => {
    try {
        return await Course.findByIdAndUpdate(id, { isTrash: true }, { new: true });
    } catch (error) {
        throw error;
    }
};

import Enrollment from '../../../../models/entrollment.js';

const findAllCourses = async (studentId) => {
    try {
        const user = await User.findById(studentId).select('enrolledCourses').lean();
        const enrolledCourseIds = user?.enrolledCourses?.map(c => c.courseId.toString()) || [];

        const courses = await Course.aggregate([
            { $match: { isTrash: false, status: 'Published' } },
            {
                $addFields: {
                    isEnrolled: { $in: [{ $toString: "$_id" }, enrolledCourseIds] }
                }
            },
            {
                $project: {
                    __v: 0,
                    updatedBy: 0,
                    createdBy: 0,
                    createdAt: 0,
                    updatedAt: 0,
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        return courses;
    } catch (error) {
        throw error;
    }
};

const findAll = async () => {
    try {
        return await Course.find({ isTrash: false, status: 'Published' });
    } catch (error) {
        throw error;
    }
};

const findAllEnrolled = async (studentId) => {
    try {
        const enrollments = await Enrollment.find({ studentId }).populate({
            path: 'courseId',
            match: { isTrash: false, status: 'Published' }
        });

        // Filter out nulls in case a course was deleted/unpublished but enrollment exists
        return enrollments.map(e => e.courseId).filter(c => c !== null);
    } catch (error) {
        throw error;
    }
};

import User from '../../../../models/user.model.js';

const findEnrolledCoursesOnly = async (studentId) => {
    try {
        const user = await User.findById(studentId).select('enrolledCourses').lean();
        const enrolledCourseIds = user?.enrolledCourses?.map(c => c.courseId) || [];

        if (enrolledCourseIds.length === 0) {
            return [];
        }

        const courses = await Course.aggregate([
            {
                $match: {
                    _id: { $in: enrolledCourseIds },
                    isTrash: false,
                    status: 'Published'
                }
            },
            {
                $addFields: {
                    isEnrolled: true
                }
            },
            {
                $project: {
                    __v: 0,
                    updatedBy: 0,
                    createdBy: 0,
                    createdAt: 0,
                    updatedAt: 0,
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        return courses;
    } catch (error) {
        throw error;
    }
};

const enrollStudent = async (studentId, courseId) => {
    try {
        const course = await Course.findOne({ _id: courseId, isTrash: false, status: 'Published' });
        if (!course) {
            return -1; // Course not found
        }

        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) {
            return -2; // Already enrolled
        }

        // Create Enrollment Record (Dummy Payment)
        const enrollment = await Enrollment.create({
            studentId,
            courseId,
            amountPaid: course.price,
            paymentStatus: 'completed',
            paymentMethod: 'N/A'
        });

        // Update User Enrolled Courses
        await User.findByIdAndUpdate(studentId, {
            $addToSet: {
                enrolledCourses: {
                    courseId: courseId,
                    enrolledAt: new Date()
                }
            }
        });

        return enrollment;
    } catch (error) {
        throw error;
    }
};

export default {
    findById,
    update,
    remove,
    findAll,
    findAllCourses,
    findAllEnrolled,
    findEnrolledCoursesOnly,
    enrollStudent,
};
