import Course from '../../../../models/course.model.js';

const findAllPublished = async () => {
    return await Course.find({ isTrash: false, status: 'Published' });
};

export default {
    findAllPublished,
};
