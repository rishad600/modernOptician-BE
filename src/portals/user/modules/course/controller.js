import courseService from './service.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';

const parsePaging = (req) => {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 20;
    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 100) limit = 100;
    return { page, limit, skip: (page - 1) * limit };
};

const buildPagedResult = ({ courses, totalCount }, page, limit) => ({
    courses,
    totalCount,
    nextPage: totalCount > limit * page ? page + 1 : -1,
});

const getCourses = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const { page, limit, skip } = parsePaging(req);
    const result = await courseService.getAllCourses(studentId, { skip, limit });
    res.json(Response.success('Courses fetched successfully', buildPagedResult(result, page, limit)));
});

const getEnrolledCourses = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const { page, limit, skip } = parsePaging(req);
    const result = await courseService.getAllEnrolledCourses(studentId, { skip, limit });
    res.json(
        Response.success('Enrolled courses fetched successfully', buildPagedResult(result, page, limit))
    );
});

const getCourse = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const course = await courseService.getCourseById(req.params.id, studentId);
    if (!course) {
        return res.status(404).json(Response.error('Course not found', 404));
    }
    res.json(Response.success('Course fetched successfully', course));
});

const purchaseCourse = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const courseId = req.params.id;
    const enrollment = await courseService.purchaseCourse(studentId, courseId);

    if (enrollment === -1) {
        return res.status(400).json(Response.error('Course not found or not available for purchase', 400));
    }
    if (enrollment === -2) {
        return res.status(409).json(Response.error('You are already enrolled in this course', 409));
    }

    res.json(Response.success('Course purchased successfully', null));
});

const playVideo = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const lessonId = req.params.lessonId;
    const result = await courseService.getSignedPlayUrl(lessonId, studentId);

    if (result.success === false) {
        return res.status(result.status).json(Response.error(result.message, result.status));
    }
    return res.status(200).json(Response.success('Video playback data fetched', result));
});

export default {
    getCourses,
    getCourse,
    purchaseCourse,
    getEnrolledCourses,
    playVideo,
};
