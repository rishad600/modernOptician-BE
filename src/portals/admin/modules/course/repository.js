import mongoose from 'mongoose';
import courseModel from '../../../../models/course.model.js';
import Lesson from '../../../../models/lesson.js';

const createCourse = async (courseData) => {
    try {
        const course = await courseModel.create(courseData);
        const result = course.toObject();
        delete result.__v;
        delete result.updatedBy;
        delete result.createdBy;
        delete result.createdAt;
        delete result.updatedAt;
        return result;
    } catch (err) {
        throw err;
    }
};

const getAllCourses = async () => {
    try {
        const courses = await courseModel.find({ isTrash: false }).select('-__v -updatedBy -createdBy -createdAt -updatedAt');
        return courses;
    } catch (err) {
        throw err;
    }
};

const getOneCourse = async (id) => {
    try {
        const courses = await courseModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id), isTrash: false }
            },
            {
                $lookup: {
                    from: 'lessons',
                    localField: '_id',
                    foreignField: 'courseId',
                    as: 'lessonsArray'
                }
            },
            {
                $addFields: {
                    lessonsArray: {
                        $map: {
                            input: {
                                $sortArray: { input: "$lessonsArray", sortBy: { order: 1 } }
                            },
                            as: "lesson",
                            in: {
                                _id: "$$lesson._id",
                                title: "$$lesson.title",
                                description: "$$lesson.description",
                                videoStatus: "$$lesson.videoStatus",
                                bunnyVideoId: "$$lesson.bunnyVideoId",
                                duration: "$$lesson.duration",
                                isFreePreview: "$$lesson.isFreePreview",
                                isPublished: "$$lesson.isPublished"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    __v: 0,
                    updatedBy: 0,
                    createdBy: 0,
                    createdAt: 0,
                    updatedAt: 0,
                }
            }
        ]);
        return courses[0] || null;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

const updateCourse = async (id, courseData) => {
    try {
        const course = await courseModel.updateOne({ _id: id }, courseData);
        if (course.matchedCount === 0) {
            return false;
        }
        return true;
    } catch (err) {
        throw err;
    }
};

const deleteCourse = async (id) => {
    try {
        const existing = await courseModel.findById(id).select("isTrash");
        if (!existing) {
            return false;
        }
        if (existing.isTrash) {
            return -1;
        }

        const course = await courseModel.updateOne({ _id: id }, { isTrash: true });
        if (course.modifiedCount === 0) {
            return false;
        }
        return true;
    } catch (err) {
        throw err;
    }
};
const createLesson = async (lessonData) => {
    try {
        const lesson = await Lesson.create(lessonData);
        return lesson;
    } catch (err) {
        throw err;
    }
};

const findLessonById = async (id) => {
    try {
        return await Lesson.findById(id);
    } catch (err) {
        throw err;
    }
};

export default {
    createCourse,
    getAllCourses,
    getOneCourse,
    updateCourse,
    deleteCourse,
    createLesson,
    findLessonById,
};
