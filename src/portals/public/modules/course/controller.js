import courseService from './service.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';

const getCourses = asyncHandler(async (req, res, next) => {
    const courses = await courseService.getAllPublishedCourses();
    res.json(Response.success('Courses fetched successfully', courses));
});

export default {
    getCourses,
};
