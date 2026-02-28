export const makeCourseController = ({ courseService, asyncHandler, Response }) => {
    const createCourse = asyncHandler(async (req, res, next) => {
        const course = await courseService.createCourse(req.body);
        res.status(201).json(Response.success('Course created successfully', null, 201));
    });

    const getCourses = asyncHandler(async (req, res, next) => {
        const courses = await courseService.getAllCourses();
        res.json(Response.success('Courses fetched successfully', courses));
    });

    const getCourse = asyncHandler(async (req, res, next) => {
        const course = await courseService.getCourseById(req.params.id);
        if (!course) {
            return res.status(404).json(Response.error('Course not found', 404));
        }
        res.json(Response.success('Course fetched successfully', course));
    });

    return Object.freeze({
        createCourse,
        getCourses,
        getCourse,
    });
};
