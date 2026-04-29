import courseRepository from './repository.js';
import axios from 'axios';
import crypto from 'crypto';
import config from '../../../../config/config.js';
import Lesson from '../../../../models/lesson.model.js';
import moment from 'moment-timezone';

const createCourse = async (courseData) => courseRepository.createCourse(courseData);
const getAllCourses = async (paging) => courseRepository.getAllCourses(paging);
const getOneCourse = async (id) => courseRepository.getOneCourse(id);
const updateCourse = async (id, courseData) => courseRepository.updateCourse(id, courseData);
const deleteCourse = async (id) => courseRepository.deleteCourse(id);
const createLesson = async (lessonData) => courseRepository.createLesson(lessonData);
const updateLesson = async (id, lessonData) => courseRepository.updateLesson(id, lessonData);

const prepareVideoUpload = async (lessonId, courseId) => {
    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
        throw new Error('Lesson not found or does not belong to the specified course');
    }

    const libraryId = config.bunny.videoLibraryId;
    const apiKey = config.bunny.apiKey;

    let videoId;
    try {
        const createVideoRes = await axios.post(
            `https://video.bunnycdn.com/library/${libraryId}/videos`,
            { title: lesson.title },
            {
                headers: {
                    AccessKey: apiKey,
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
            }
        );
        videoId = createVideoRes.data.guid;
    } catch (bunnyError) {
        console.error('Bunny API Error:', bunnyError.response?.data || bunnyError.message);
        const error = new Error(
            `Bunny.net API Error: ${bunnyError.response?.data?.message || 'Failed to initialize video placeholder'}`
        );
        // 502 Bad Gateway: an upstream service we depend on failed.
        error.status = 502;
        throw error;
    }

    lesson.bunnyVideoId = videoId;
    lesson.videoStatus = 'Queued';
    await lesson.save();

    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    const signatureString = `${libraryId}${apiKey}${expirationTime}${videoId}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    return {
        videoId,
        libraryId,
        signature,
        expirationTime,
        tusEndpoint: 'https://video.bunnycdn.com/tusupload',
    };
};

const getSignedPlayUrl = async (lessonId) => {
    const lesson = await Lesson.findById(lessonId).select('bunnyVideoId title').lean();
    if (!lesson) {
        return { status: 404, message: 'Lesson not found', success: false };
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

const deleteVideo = async (bunnyVideoId) => {
    const libraryId = config.bunny.videoLibraryId;
    const apiKey = config.bunny.apiKey;

    try {
        await axios.delete(
            `https://video.bunnycdn.com/library/${libraryId}/videos/${bunnyVideoId}`,
            {
                headers: {
                    AccessKey: apiKey,
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
            }
        );
    } catch (bunnyError) {
        console.error('Bunny API Delete Error:', bunnyError.response?.data || bunnyError.message);
        // If the video is already gone (404), proceed to clean up our DB anyway.
        if (bunnyError.response?.status !== 404) {
            throw new Error(
                `Bunny.net API Error: ${bunnyError.response?.data?.message || 'Failed to delete video from Bunny.net'}`
            );
        }
    }

    const result = await Lesson.updateMany(
        { bunnyVideoId },
        { $set: { bunnyVideoId: null, videoStatus: null, videoUrl: null } }
    );

    return { success: true, modifiedCount: result.modifiedCount };
};

const trashLesson = async (id, isTrash) => {
    const lesson = await Lesson.findById(id);
    if (!lesson) {
        return { status: 404, message: 'Lesson not found', success: false };
    }

    if (lesson.isTrash === isTrash) {
        return {
            status: 409,
            message: `Lesson is already ${isTrash ? 'trashed' : 'restored'}`,
            success: false,
        };
    }

    lesson.isTrash = isTrash;
    await lesson.save();

    return {
        status: 200,
        message: `Lesson ${isTrash ? 'trashed' : 'restored'} successfully`,
        success: true,
    };
};

export default {
    createCourse,
    getAllCourses,
    getOneCourse,
    updateCourse,
    deleteCourse,
    prepareVideoUpload,
    createLesson,
    getSignedPlayUrl,
    deleteVideo,
    trashLesson,
    updateLesson,
};
