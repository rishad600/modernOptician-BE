import crypto from 'crypto';
import config from '../../../../config/config.js';
import Lesson from '../../../../models/lesson.model.js';
import Response from '../../../../utils/response.js';
import {
    BUNNY_STATUS_LABEL,
    BUNNY_STATUS_PRIORITY,
    BUNNY_PLAYABLE_STATUSES,
} from '../../../../constants/bunny.constants.js';

const handleBunnyWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-bunnystream-signature'];
        const secret = config.bunny.webhookSecret;

        if (!signature || !secret) {
            console.error('Webhook Error: Missing signature or secret');
            return res.status(401).json(Response.error('Unauthorized', 401));
        }

        const hash = crypto
            .createHmac('sha256', secret)
            .update(req.rawBody)
            .digest('hex');

        if (hash !== signature) {
            console.error('Webhook Error: Invalid signature');
            return res.status(401).json(Response.error('Invalid signature', 401));
        }

        const { VideoLibraryId, VideoGuid, Status } = req.body;
        const statusString = BUNNY_STATUS_LABEL[Status] || 'Processing';

        console.log(`Bunny Webhook: Video ${VideoGuid} in Library ${VideoLibraryId} is ${statusString}`);

        const lesson = await Lesson.findOne({ bunnyVideoId: VideoGuid });
        if (!lesson) {
            console.warn(`Webhook Warning: No lesson found for VideoGuid ${VideoGuid}`);
            return res.status(200).json(Response.success('Webhook acknowledged', null, 200));
        }

        const currentPriority = BUNNY_STATUS_PRIORITY[lesson.videoStatus] ?? 0;
        const incomingPriority = BUNNY_STATUS_PRIORITY[statusString] ?? 0;

        if (incomingPriority < currentPriority) {
            console.log(
                `Ignoring out-of-order webhook for ${VideoGuid}: ${statusString} <= ${lesson.videoStatus}`
            );
            return res
                .status(200)
                .json(Response.success('Webhook acknowledged (ignored, out of order)', null, 200));
        }

        lesson.videoStatus = statusString;
        if (BUNNY_PLAYABLE_STATUSES.has(Status)) {
            lesson.videoUrl = `https://iframe.mediadelivery.net/play/${VideoLibraryId}/${VideoGuid}`;
        }
        await lesson.save();

        return res.status(200).json(Response.success('Webhook processed', null, 200));
    } catch (error) {
        console.error('Webhook Error:', error.message);
        return res.status(500).json(Response.error('Internal server error', 500));
    }
};

export default {
    handleBunnyWebhook,
};
