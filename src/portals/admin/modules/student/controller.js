import studentService from "./service.js";
import asyncHandler from "../../../../utils/asyncHandler.js";
import Response from "../../../../utils/response.js";

const getUsersList = asyncHandler(async (req, res, next) => {
    try {
        const { search = '', status = '' } = req.query;
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 20;

        if (page < 1) page = 1;
        if (limit < 1) limit = 20;

        const result = await studentService.getUsersList(search, status, page, limit);
        return res.json(Response.success("Users fetched successfully", result));
    } catch (error) {
        return res.status(500).json(Response.error("An error occurred while fetching the student list. Please try again later.", 500));
    }
});

const getStudentById = asyncHandler(async (req, res, next) => {
    try {
        const student = await studentService.getStudentById(req.params.id);
        if (!student) {
            return res.status(400).json(Response.error("Student not found", 400));
        }
        return res.json(Response.success("Student details fetched successfully", student));
    } catch (error) {
        return res.status(500).json(Response.error("An error occurred while fetching the student details. Please try again later.", 500));
    }
});

const getStats = asyncHandler(async (req, res, next) => {
    try {
        const stats = await studentService.getStats();
        return res.json(Response.success("Stats fetched successfully", stats));
    } catch (error) {
        return res.status(500).json(Response.error("An error occurred while fetching the dashboard statistics. Please try again later.", 500));
    }
});

const deleteStudent = asyncHandler(async (req, res, next) => {
    try {
        const student = await studentService.deleteStudent(req.params.id);
        if (!student) {
            return res.status(206).json(Response.error("Your update couldn't be completed at this time. Please refresh and try again.", 206));
        }
        if (student === -1) {
            return res.status(400).json(Response.error("This item no longer exists or has already been deleted.", 400));
        }
        return res.status(200).json(Response.success("Student deleted successfully", null, 200));
    } catch (error) {
        return res.status(500).json(Response.error("Failed to delete student", 500));
    }
});

export default {
    getUsersList,
    getStudentById,
    getStats,
    deleteStudent
};
