import courseService from './service.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';
import { parsePaging, buildPagedResult } from '../../../../utils/paging.js';

const getCourses = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePaging(req.query);
    const { search = '', category = '' } = req.query;
    const { items, totalCount } = await courseService.getAllPublishedCourses({ skip, limit, search, category });
    res.json(
        Response.success(
            'Courses fetched successfully',
            buildPagedResult(items, totalCount, page, limit, 'courses')
        )
    );
});

const getOne = asyncHandler(async (req, res) => {
    const course = await courseService.getOneCourse(req.params.id);
    if (!course) {
        return res.status(404).json(Response.error('Course not found', 404));
    }
    res.json(Response.success('Course fetched successfully', course));
});

const playVideo = asyncHandler(async (req, res) => {
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
