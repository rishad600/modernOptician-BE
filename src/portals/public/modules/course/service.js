import courseRepository from './repository.js';

const getAllPublishedCourses = async () => {
    return await courseRepository.findAllPublished();
};

export default {
    getAllPublishedCourses,
};
