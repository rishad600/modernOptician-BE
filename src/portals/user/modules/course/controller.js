import courseService from './service.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';

const getCourses = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const courses = await courseService.getAllCourses(studentId);
    res.json(Response.success('Courses fetched successfully', courses));
});

const getCourse = asyncHandler(async (req, res, next) => {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
        return res.status(404).json(Response.error('Course not found', 404));
    }
    res.json(Response.success('Course fetched successfully', course));
});

export default {
    getCourses,
    getCourse,
};
