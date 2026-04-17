import courseRepository from './repository.js';
import crypto from 'crypto';
import moment from 'moment-timezone';
import config from '../../../../config/config.js';
import Lesson from '../../../../models/lesson.js';
import User from '../../../../models/user.model.js';

const getAllCourses = async (studentId) => {
    try {
        return await courseRepository.findAllCourses(studentId);
    } catch (error) {
        throw error;
    }
};

const getAllEnrolledCourses = async (studentId) => {
    try {
        return await courseRepository.findEnrolledCoursesOnly(studentId);
    } catch (error) {
        throw error;
    }
};

const getCourseById = async (id, studentId) => {
    try {
        return await courseRepository.findById(id, studentId);
    } catch (error) {
        throw error;
    }
};

const updateCourse = async (id, updateData) => {
    try {
        return await courseRepository.update(id, updateData);
    } catch (error) {
        throw error;
    }
};

const deleteCourse = async (id) => {
    try {
        return await courseRepository.remove(id); // Changed to 'remove' to match new repository
    } catch (error) {
        throw error;
    }
};

const purchaseCourse = async (studentId, courseId) => {
    try {
        return await courseRepository.enrollStudent(studentId, courseId);
    } catch (error) {
        throw error;
    }
};

const getSignedPlayUrl = async (lessonId, studentId) => {
    try {
        const lesson = await Lesson.findById(lessonId).select('courseId bunnyVideoId title isFreePreview isPublished isTrashed').lean();

        if (!lesson || lesson.isTrashed || !lesson.isPublished) {
            return {
                status: 400,
                message: 'Lesson not found or unavailable',
                success: false
            };
        }

        // Check enrollment
        const user = await User.findById(studentId).select('enrolledCourses').lean();
        const enrolledCourseIds = user?.enrolledCourses?.map(c => c.courseId.toString()) || [];
        const isEnrolled = enrolledCourseIds.includes(lesson.courseId.toString());

        if (!isEnrolled && !lesson.isFreePreview) {
            return {
                status: 403,
                message: 'Please purchase the course to access this video.',
                success: false,
                isPurchaseRequired: true
            };
        }

        if (!lesson.bunnyVideoId) {
            return {
                status: 206,
                message: 'Video not uploaded for this lesson yet',
                success: false
            };
        }

        const libraryId = config.bunny.videoLibraryId;
        const securityKey = config.bunny.streamTokenKey;
        const videoId = lesson.bunnyVideoId;
        const expires = moment().tz(config.timezone).add(2, 'hours').unix();

        const token = crypto.createHash('sha256').update(securityKey + videoId + expires).digest('hex');

        return {
            success: true,
            playUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`,
            expires
        };
    } catch (error) {
        throw error;
    }
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
