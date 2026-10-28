import courseRepository from './repository.js';
import crypto from 'crypto';
import moment from 'moment-timezone';
import config from '../../../../config/config.js';
import Lesson from '../../../../models/lesson.model.js';

const getAllPublishedCourses = async (paging) => courseRepository.findAllPublished(paging);
const getOneCourse = async (id) => courseRepository.getOneCourse(id);

const getPublicSignedPlayUrl = async (lessonId) => {
    const lesson = await Lesson.findById(lessonId)
        .select('bunnyVideoId title isFreePreview isPublished isTrash')
        .lean();

    if (!lesson || lesson.isTrash || !lesson.isPublished) {
        return { status: 404, message: 'Lesson not found or unavailable', success: false };
    }

    if (!lesson.isFreePreview) {
        return {
            status: 403,
            message: 'Please purchase the course to access this video. This content is reserved for enrolled students only',
            success: false,
            isPurchaseRequired: true,
        };
    }

    if (!lesson.bunnyVideoId) {
        return { status: 404, message: 'Video not uploaded for this lesson yet', success: false };
    }

    const libraryId = config.bunny.videoLibraryId;
    const securityKey = config.bunny.streamTokenKey;
    const videoId = lesson.bunnyVideoId;
    const expires = moment().tz(config.timezone).add(2, 'hours').unix();
    const token = crypto
        .createHash('sha256')
        .update(securityKey + videoId + expires)
        .digest('hex');

    return {
        success: true,
        playUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`,
        expires,
    };
};

export default {
    getAllPublishedCourses,
    getOneCourse,
    getPublicSignedPlayUrl,
};
