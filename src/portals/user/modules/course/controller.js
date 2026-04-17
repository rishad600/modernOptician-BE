import courseService from './service.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';

const getCourses = asyncHandler(async (req, res, next) => {
    try {
        const studentId = req.user._id;
        const courses = await courseService.getAllCourses(studentId);
        res.json(Response.success('Courses fetched successfully', courses));
    } catch (error) {
        return res.status(500).json(Response.error('An error occurred while fetching your courses. Please try again later.', 500));
    }
});

const getEnrolledCourses = asyncHandler(async (req, res, next) => {
    try {
        const studentId = req.user._id;
        const courses = await courseService.getAllEnrolledCourses(studentId);
        res.json(Response.success('Enrolled courses fetched successfully', courses));
    } catch (error) {
        return res.status(500).json(Response.error('An error occurred while fetching your enrolled courses. Please try again later.', 500));
    }
});

const getCourse = asyncHandler(async (req, res, next) => {
    try {
        const studentId = req.user._id;
        const course = await courseService.getCourseById(req.params.id, studentId);
        if (!course) {
            return res.status(400).json(Response.error('Course not found', 404));
        }
        res.json(Response.success('Course fetched successfully', course));
    } catch (error) {
        return res.status(500).json(Response.error('An error occurred while fetching course details. Please try again later.', 500));
    }
});

const purchaseCourse = asyncHandler(async (req, res, next) => {
    try {
        const studentId = req.user._id;
        const courseId = req.params.id;
        const enrollment = await courseService.purchaseCourse(studentId, courseId);

        if (enrollment === -1) {
            return res.status(400).json(Response.error('Course not found or not available for purchase', 400));
        }
        if (enrollment === -2) {
            return res.status(400).json(Response.error('You are already enrolled in this course', 400));
        }

        res.json(Response.success('Course purchased successfully', null));
    } catch (error) {
        return res.status(500).json(Response.error('An error occurred while processing your purchase. Please try again later.', 500));
    }
});

const playVideo = asyncHandler(async (req, res, next) => {
    try {
        const studentId = req.user._id;
        const lessonId = req.params.lessonId;
        const result = await courseService.getSignedPlayUrl(lessonId, studentId);

        if (result.success === false) {
            return res.status(result.status).json(Response.error(result.message, result.status));
        }

        return res.status(200).json(Response.success('Video playback data fetched', result));
    } catch (error) {
        return res.status(500).json(Response.error('An error occurred while fetching video playback data. Please try again later.', 500));
    }
});

export default {
    getCourses,
    getCourse,
    purchaseCourse,
    getEnrolledCourses,
    playVideo,
};
