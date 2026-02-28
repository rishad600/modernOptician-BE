import Course from '../../../../models/course.model.js';

export const makeCourseRepository = ({ Course }) => {
    const create = async (courseData) => {
        return await Course.create(courseData);
    };

    const findById = async (id) => {
        return await Course.findById(id);
    };

    const update = async (id, updateData) => {
        return await Course.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
    };

    const remove = async (id) => {
        return await Course.findByIdAndUpdate(id, { isTrash: true }, { new: true });
    };

    const findAll = async () => {
        return await Course.find({ isTrash: false });
    };

    return Object.freeze({
        create,
        findById,
        update,
        remove,
        findAll,
    });
};
