import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';
import courseService from './service.js';
import courseDto from './dto.js';
import bunnyStorage from '../../../../utils/bunnyStorage.js';
import { parsePaging, buildPagedResult } from '../../../../utils/paging.js';

const create = asyncHandler(async (req, res) => {
    if (req.file) {
        req.body.thumbnail = await bunnyStorage.uploadFile(req.file.buffer, req.file.originalname, 'courses');
    }
    const courseDTO = courseDto.createCourseDTO(req.body, req.admin._id);
    const course = await courseService.createCourse(courseDTO);
    return res.status(201).json(Response.success('Course created successfully', course, 201));
});

const getAll = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePaging(req.query);
    const { search = '', status = '' } = req.query;
    const { items, totalCount } = await courseService.getAllCourses({ skip, limit, search, status });
    return res
        .status(200)
        .json(Response.success('Courses fetched successfully', buildPagedResult(items, totalCount, page, limit, 'courses'), 200));
});

const getOne = asyncHandler(async (req, res) => {
    const course = await courseService.getOneCourse(req.params.id);
    if (!course) {
        return res.status(404).json(Response.error('Course not found', 404));
    }
    return res.status(200).json(Response.success('Course fetched successfully', course, 200));
});

const update = asyncHandler(async (req, res) => {
    if (req.file) {
        req.body.thumbnail = await bunnyStorage.uploadFile(req.file.buffer, req.file.originalname, 'courses');
    }
    const updateDTO = courseDto.updateCourseDTO(req.body, req.admin._id);
    const updated = await courseService.updateCourse(req.params.id, updateDTO);
    if (!updated) {
        return res.status(404).json(Response.error('Resource not found or already removed.', 404));
    }
    return res.status(200).json(Response.success('Course updated successfully', null, 200));
});

const deleteCourse = asyncHandler(async (req, res) => {
    const result = await courseService.deleteCourse(req.params.id);
    if (!result) {
        return res.status(404).json(Response.error('Resource not found or already removed.', 404));
    }
    if (result === -1) {
        return res.status(409).json(Response.error('This item no longer exists or has already been deleted.', 409));
    }
    return res.status(200).json(Response.success('Course deleted successfully', null, 200));
});

const addLesson = asyncHandler(async (req, res) => {
    const lesson = await courseService.createLesson(req.body);
    return res.status(201).json(Response.success('Lesson created successfully', lesson, 201));
});

const prepareVideoUpload = asyncHandler(async (req, res) => {
    const { lessonId, courseId } = req.body;
    const result = await courseService.prepareVideoUpload(lessonId, courseId);
    return res.status(200).json(Response.success('Upload signature generated successfully', result, 200));
});

const playVideo = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const result = await courseService.getSignedPlayUrl(lessonId);
    if (result.success === false) {
        return res.status(result.status).json(Response.error(result.message, result.status));
    }
    return res.status(200).json(Response.success('Signed playback URL generated', result, 200));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { bunnyVideoId } = req.params;
    await courseService.deleteVideo(bunnyVideoId);
    return res.status(200).json(Response.success('Video deleted successfully', null, 200));
});

const trashLesson = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isTrash } = req.body;
    const result = await courseService.trashLesson(id, isTrash);
    if (result.success === false) {
        return res.status(result.status).json(Response.error(result.message, result.status));
    }
    return res.status(200).json(Response.success(result.message, null, 200));
});

const updateLesson = asyncHandler(async (req, res) => {
    const updateDTO = courseDto.updateLessonDTO(req.body);
    const lesson = await courseService.updateLesson(req.params.id, updateDTO);
    if (!lesson) {
        return res.status(404).json(Response.error('Resource not found or already removed.', 404));
    }
    return res.status(200).json(Response.success('Lesson updated successfully', null, 200));
});

export default {
    create,
    getAll,
    getOne,
    update,
    deleteCourse,
    prepareVideoUpload,
    addLesson,
    playVideo,
    deleteVideo,
    trashLesson,
    updateLesson,
};
