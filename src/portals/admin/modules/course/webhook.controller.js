import crypto from 'crypto';
import config from '../../../../config/config.js';
import Lesson from '../../../../models/lesson.js';
import Response from '../../../../utils/response.js';

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

        const statusMap = {
            0: 'Queued',
            1: 'Processing',
            2: 'Encoding',
            3: 'Finished',
            4: 'ResolutionFinished',
            5: 'Failed',
            6: 'PresignedUploadStarted',
            7: 'PresignedUploadFinished',
            8: 'PresignedUploadFailed'
        };

        const statusString = statusMap[Status] || 'Processing';

        console.log(`Bunny Webhook: Video ${VideoGuid} in Library ${VideoLibraryId} is ${statusString}`);

        // Update Lesson in database
        const updateData = { videoStatus: statusString };

        // If video is playable, ensure URL is set
        if (Status === 3 || Status === 4) {
            updateData.videoUrl = `https://iframe.mediadelivery.net/play/${VideoLibraryId}/${VideoGuid}`;
        }

        const lesson = await Lesson.findOneAndUpdate(
            { bunnyVideoId: VideoGuid },
            updateData,
            { new: true }
        );

        if (!lesson) {
            console.warn(`Webhook Warning: No lesson found for VideoGuid ${VideoGuid}`);
        }

        return res.status(200).json(Response.success('Webhook processed', null, 200));
    } catch (error) {
        console.error('Webhook Error:', error.message);
        return res.status(500).json(Response.error('Internal server error', 500));
    }
};

export default {
    handleBunnyWebhook,
};
