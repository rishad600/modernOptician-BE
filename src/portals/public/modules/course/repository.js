import mongoose from 'mongoose';
import Course from '../../../../models/course.model.js';

const findAllPublished = async () => {
    return await Course.find({ isTrash: false, status: 'Published' })
        .select('-__v -updatedBy -createdBy -createdAt -updatedAt')
        .lean();
};

const getOneCourse = async (id) => {
    try {
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
                                isTrashed: "$$lesson.isTrashed"
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

export default {
    findAllPublished,
    getOneCourse,
};
