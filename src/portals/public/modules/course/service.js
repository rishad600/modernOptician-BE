import courseRepository from './repository.js';
import crypto from 'crypto';
import moment from 'moment-timezone';
import config from '../../../../config/config.js';
import Lesson from '../../../../models/lesson.js';

const getAllPublishedCourses = async () => {
    return await courseRepository.findAllPublished();
};

const getOneCourse = async (id) => {
    return await courseRepository.getOneCourse(id);
};

const getPublicSignedPlayUrl = async (lessonId) => {
    try {
        const lesson = await Lesson.findById(lessonId).select('bunnyVideoId title isFreePreview isPublished isTrashed').lean();

        if (!lesson || lesson.isTrashed || !lesson.isPublished) {
            return {
                status: 404,
                message: 'Lesson not found or unavailable',
                success: false
            };
        }

        if (!lesson.isFreePreview) {
            return {
                status: 403, // Using 403 for Forbidden/Purchase Required
                message: 'Please purchase the course to access this video. This content is reserved for enrolled students only',
                success: false,
                isPurchaseRequired: true
            };
        }

        if (!lesson.bunnyVideoId) {
            return {
                status: 206,
                message: 'Video not uploaded for this lesson yet',
                success: false
            };
        }

        const libraryId = config.bunny.videoLibraryId;
        const securityKey = config.bunny.streamTokenKey;
        const videoId = lesson.bunnyVideoId;
        const expires = moment().tz(config.timezone).add(2, 'hours').unix();

        // For secure playback Bunny requirements: SHA256(securityKey + videoId + expires)
        const token = crypto.createHash('sha256').update(securityKey + videoId + expires).digest('hex');

        return {
            success: true,
            playUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`,
            expires
        };
    } catch (error) {
        throw error;
    }
};

export default {
    getAllPublishedCourses,
    getOneCourse,
    getPublicSignedPlayUrl,
};
