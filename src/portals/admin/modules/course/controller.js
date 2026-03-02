import Response from '../../../../utils/response.js';
import courseService from './service.js';
import courseDto from './dto.js';

const create = async (req, res, next) => {
    try {
        const courseDTO = courseDto.createCourseDTO(req.body, req.admin._id);

        const course = await courseService.createCourse(courseDTO);
        return res.status(201).json(Response.success('Course created successfully', course, 201));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to create course', 500));
    }
};

const getAll = async (req, res, next) => {
    try {
        const courses = await courseService.getAllCourses();
        return res.status(200).json(Response.success('Courses fetched successfully', courses, 200));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to fetch courses', 500));
    }
};

const getOne = async (req, res, next) => {
    try {
        const course = await courseService.getOneCourse(req.params.id);
        return res.status(200).json(Response.success('Course fetched successfully', course, 200));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to fetch course', 500));
    }
};

const update = async (req, res, next) => {
    try {
        const updateDTO = courseDto.updateCourseDTO(req.body, req.admin._id);
        const course = await courseService.updateCourse(req.params.id, updateDTO);
        return res.status(200).json(Response.success('Course updated successfully', course, 200));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to update course', 500));
    }
};

const deleteCourse = async (req, res, next) => {
    try {
        const course = await courseService.deleteCourse(req.params.id);
        return res.status(200).json(Response.success('Course deleted successfully', course, 200));
    } catch (error) {
        return res.status(500).json(Response.error(error.message || 'Failed to delete course', 500));
    }
};

export default {
    create,
    getAll,
    getOne,
    update,
    deleteCourse,
};