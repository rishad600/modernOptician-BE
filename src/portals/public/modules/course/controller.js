import courseService from './service.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';

const getCourses = asyncHandler(async (req, res, next) => {
    const courses = await courseService.getAllPublishedCourses();
    res.json(Response.success('Courses fetched successfully', courses));
});

const getOne = asyncHandler(async (req, res, next) => {
    const course = await courseService.getOneCourse(req.params.id);
    if (!course) {
        return res.status(400).json(Response.error('Course not found', 400));
    }
    res.json(Response.success('Course fetched successfully', course));
});

const playVideo = asyncHandler(async (req, res, next) => {
    const result = await courseService.getPublicSignedPlayUrl(req.params.lessonId);

    if (result.success === false) {
        return res.status(result.status).json(Response.error(result.message, result.status));
    }

    return res.status(200).json(Response.success('Signed playback URL generated', result, 200));
});

export default {
    getCourses,
    getOne,
    playVideo,
};
