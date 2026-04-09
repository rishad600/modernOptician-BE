import courseRepository from './repository.js';
import axios from 'axios';
import crypto from 'crypto';
import config from '../../../../config/config.js';
import Lesson from '../../../../models/lesson.js';
import moment from 'moment-timezone';

const createCourse = async (courseData) => {
    try {
        const course = await courseRepository.createCourse(courseData);
        return course;
    } catch (error) {
        throw error;
    }
};

const getAllCourses = async () => {
    try {
        const courses = await courseRepository.getAllCourses();
        return courses;
    } catch (error) {
        throw error;
    }
};

const getOneCourse = async (id) => {
    try {
        const course = await courseRepository.getOneCourse(id);
        return course;
    } catch (error) {
        throw error;
    }
};

const updateCourse = async (id, courseData) => {
    try {
        const course = await courseRepository.updateCourse(id, courseData);
        return course;
    } catch (error) {
        throw error;
    }
};

const deleteCourse = async (id) => {
    try {
        const course = await courseRepository.deleteCourse(id);
        return course;
    } catch (error) {
        throw error;
    }
};

const createLesson = async (lessonData) => {
    try {
        const lesson = await courseRepository.createLesson(lessonData);
        return lesson;
    } catch (error) {
        throw error;
    }
};

const prepareVideoUpload = async (lessonId, courseId) => {
    try {
        // 1. Validate Lesson first
        const lesson = await Lesson.findOne({
            _id: lessonId,
            courseId: courseId
        });

        if (!lesson) {
            throw new Error('Lesson not found or does not belong to the specified course');
        }

        const libraryId = config.bunny.videoLibraryId;
        const apiKey = config.bunny.apiKey;

        // 2. Create Video Record on Bunny.net to get VideoID
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
            const error = new Error(`Bunny.net API Error: ${bunnyError.response?.data?.message || 'Failed to initialize video placeholder'}`);
            error.status = 206;
            throw error;
        }

        // 3. Link Video to Lesson and set status
        lesson.bunnyVideoId = videoId;
        lesson.videoStatus = 'Queued';
        await lesson.save();

        // 4. Generate TUS Signature
        const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const signatureString = `${libraryId}${apiKey}${expirationTime}${videoId}`;
        const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

        return {
            videoId,
            libraryId,
            signature,
            expirationTime,
            tusEndpoint: 'https://video.bunnycdn.com/tusupload'
        };
    } catch (error) {
        if (error.status === 206) throw error;
        console.error('Bunny primary request error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to prepare video upload on Bunny.net');
    }
};

const getSignedPlayUrl = async (lessonId) => {
    try {
        const lesson = await Lesson.findById(lessonId).select('bunnyVideoId title').lean();
        if (!lesson) {
            return {
                status: 206,
                message: 'Lesson not found',
                success: false
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
    createCourse,
    getAllCourses,
    getOneCourse,
    updateCourse,
    deleteCourse,
    prepareVideoUpload,
    createLesson,
    getSignedPlayUrl,
};
