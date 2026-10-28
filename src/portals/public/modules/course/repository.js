import mongoose from 'mongoose';
import Course from '../../../../models/course.model.js';

const findAllPublished = async ({ skip = 0, limit = 20, search = '', category = '' } = {}) => {
    const filter = { isTrash: false, status: 'Published' };
    if (category) filter.category = category;
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { instructorName: { $regex: search, $options: 'i' } },
        ];
    }

    const [items, totalCount] = await Promise.all([
        Course.find(filter)
            .select('-__v -updatedBy -createdBy -createdAt -updatedAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Course.countDocuments(filter),
    ]);

    return { items, totalCount };
};

const getOneCourse = async (id) => {
    const courses = await Course.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    isTrash: false,
                    status: 'Published'
                }
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
                                isPublished: "$$lesson.isPublished",
                                isTrash: "$$lesson.isTrash"
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

export default {
    findAllPublished,
    getOneCourse,
};
