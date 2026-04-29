import studentService from "./service.js";
import asyncHandler from "../../../../utils/asyncHandler.js";
import Response from "../../../../utils/response.js";

const getUsersList = asyncHandler(async (req, res) => {
    const { search = '', status = '' } = req.query;
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 20;
    if (page < 1) page = 1;
    if (limit < 1) limit = 20;

    const result = await studentService.getUsersList(search, status, page, limit);
    return res.json(Response.success("Users fetched successfully", result));
});

const getStudentById = asyncHandler(async (req, res) => {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) {
        return res.status(404).json(Response.error("Student not found", 404));
    }
    return res.json(Response.success("Student details fetched successfully", student));
});

const getStats = asyncHandler(async (req, res) => {
    const stats = await studentService.getStats();
    return res.json(Response.success("Stats fetched successfully", stats));
});

const deleteStudent = asyncHandler(async (req, res) => {
    const student = await studentService.deleteStudent(req.params.id);
    if (!student) {
        return res.status(404).json(Response.error("Student not found.", 404));
    }
    if (student === -1) {
        return res.status(409).json(Response.error("This item no longer exists or has already been deleted.", 409));
    }
    return res.status(200).json(Response.success("Student deleted successfully", null, 200));
});

export default {
    getUsersList,
    getStudentById,
    getStats,
    deleteStudent,
};
