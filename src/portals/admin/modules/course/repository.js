import mongoose from 'mongoose';
import courseModel from '../../../../models/course.model.js';
import Lesson from '../../../../models/lesson.model.js';

const PROJECTION = '-__v -updatedBy -createdBy -createdAt -updatedAt';
const STRIP_FIELDS = ['__v', 'updatedBy', 'createdBy', 'createdAt', 'updatedAt'];

const stripInternalFields = (doc) => {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    for (const f of STRIP_FIELDS) delete obj[f];
    return obj;
};

const createCourse = async (courseData) => {
    const course = await courseModel.create(courseData);
    return stripInternalFields(course);
};

const getAllCourses = async ({ skip = 0, limit = 20, search = '', status = '' } = {}) => {
    const filter = { isTrash: false };
    if (status) filter.status = status;
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { instructorName: { $regex: search, $options: 'i' } },
        ];
    }

    const [items, totalCount] = await Promise.all([
        courseModel.find(filter).select(PROJECTION).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        courseModel.countDocuments(filter),
    ]);

    return { items, totalCount };
};

const getOneCourse = async (id) => {
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
                        input: { $sortArray: { input: '$lessonsArray', sortBy: { order: 1 } } },
                        as: 'lesson',
                        in: {
                            _id: '$$lesson._id',
                            title: '$$lesson.title',
                            description: '$$lesson.description',
                            videoStatus: '$$lesson.videoStatus',
                            bunnyVideoId: '$$lesson.bunnyVideoId',
                            duration: '$$lesson.duration',
                            isFreePreview: '$$lesson.isFreePreview',
                            isPublished: '$$lesson.isPublished',
                            isTrash: '$$lesson.isTrash'
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
};

const updateCourse = async (id, courseData) => {
    const course = await courseModel.updateOne({ _id: id }, courseData);
    return course.matchedCount !== 0;
};

const deleteCourse = async (id) => {
    const existing = await courseModel.findById(id).select('isTrash');
    if (!existing) return false;
    if (existing.isTrash) return -1;

    const course = await courseModel.updateOne({ _id: id }, { isTrash: true });
    return course.modifiedCount !== 0;
};

const createLesson = async (lessonData) => {
    lessonData.isPublished = true;
    return await Lesson.create(lessonData);
};

const findLessonById = async (id) => Lesson.findById(id);

const updateLesson = async (id, lessonData) => {
    const lesson = await Lesson.updateOne({ _id: id }, lessonData);
    return lesson.matchedCount !== 0;
};

export default {
    createCourse,
    getAllCourses,
    getOneCourse,
    updateCourse,
    deleteCourse,
    createLesson,
    findLessonById,
    updateLesson,
};
