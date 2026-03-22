import Course from '../../../../models/course.model.js';

const findAllPublished = async () => {
    return await Course.find({ isTrash: false, isPublished: true });
};

export default {
    findAllPublished,
};
