import courseRepository from './repository.js';
import crypto from 'crypto';
import moment from 'moment-timezone';
import config from '../../../../config/config.js';
import Lesson from '../../../../models/lesson.model.js';
import Enrollment from '../../../../models/enrollment.model.js';

const getAllCourses = async (studentId, paging) => courseRepository.findAllCourses(studentId, paging);

const getAllEnrolledCourses = async (studentId, paging) =>
    courseRepository.findEnrolledCoursesOnly(studentId, paging);

const getCourseById = async (id, studentId) => courseRepository.findById(id, studentId);

const updateCourse = async (id, updateData) => courseRepository.update(id, updateData);

const deleteCourse = async (id) => courseRepository.remove(id);

const purchaseCourse = async (studentId, courseId) =>
    courseRepository.enrollStudent(studentId, courseId);

const getSignedPlayUrl = async (lessonId, studentId) => {
    const lesson = await Lesson.findById(lessonId)
        .select('courseId bunnyVideoId title isFreePreview isPublished isTrash')
        .lean();

    if (!lesson || lesson.isTrash || !lesson.isPublished) {
        return { status: 400, message: 'Lesson not found or unavailable', success: false };
    }

    // Source of truth: a completed enrollment for (studentId, lesson.courseId).
    const enrollment = await Enrollment.findOne({
        studentId,
        courseId: lesson.courseId,
        paymentStatus: 'completed',
    }).lean();
    const isEnrolled = !!enrollment;

    if (!isEnrolled && !lesson.isFreePreview) {
        return {
            status: 403,
            message: 'Please purchase the course to access this video.',
            success: false,
            isPurchaseRequired: true,
        };
    }

    if (!lesson.bunnyVideoId) {
        return { status: 404, message: 'Video not uploaded for this lesson yet', success: false };
    }

    const libraryId = config.bunny.videoLibraryId;
    const securityKey = config.bunny.streamTokenKey;
    const videoId = lesson.bunnyVideoId;
    const expires = moment().tz(config.timezone).add(2, 'hours').unix();
    const token = crypto
        .createHash('sha256')
        .update(securityKey + videoId + expires)
        .digest('hex');

    return {
        success: true,
        playUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`,
        expires,
    };
};

export default {
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    purchaseCourse,
    getAllEnrolledCourses,
    getSignedPlayUrl,
};
