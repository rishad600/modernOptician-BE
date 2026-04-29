// Bunny.net Stream webhook status codes — extracted from the webhook handler.
// See: https://docs.bunny.net/reference/video_webhooks
export const BUNNY_STATUS = {
    QUEUED: 0,
    PROCESSING: 1,
    ENCODING: 2,
    FINISHED: 3,
    RESOLUTION_FINISHED: 4,
    FAILED: 5,
    PRESIGNED_UPLOAD_STARTED: 6,
    PRESIGNED_UPLOAD_FINISHED: 7,
    PRESIGNED_UPLOAD_FAILED: 8,
};

export const BUNNY_STATUS_LABEL = {
    [BUNNY_STATUS.QUEUED]: 'Queued',
    [BUNNY_STATUS.PROCESSING]: 'Processing',
    [BUNNY_STATUS.ENCODING]: 'Encoding',
    [BUNNY_STATUS.FINISHED]: 'Finished',
    [BUNNY_STATUS.RESOLUTION_FINISHED]: 'ResolutionFinished',
    [BUNNY_STATUS.FAILED]: 'Failed',
    [BUNNY_STATUS.PRESIGNED_UPLOAD_STARTED]: 'PresignedUploadStarted',
    [BUNNY_STATUS.PRESIGNED_UPLOAD_FINISHED]: 'PresignedUploadFinished',
    [BUNNY_STATUS.PRESIGNED_UPLOAD_FAILED]: 'PresignedUploadFailed',
};

// Lifecycle priority — higher = more advanced. Webhook handler ignores any update
// that would regress a lesson's status, since Bunny doesn't guarantee delivery order.
// Failure outranks everything because it's terminal.
export const BUNNY_STATUS_PRIORITY = {
    null: 0,
    Queued: 1,
    PresignedUploadStarted: 1,
    Processing: 2,
    PresignedUploadFinished: 2,
    Encoding: 3,
    Finished: 4,
    ResolutionFinished: 5,
    Failed: 99,
    PresignedUploadFailed: 99,
};

// Statuses for which the lesson should have a playable URL.
export const BUNNY_PLAYABLE_STATUSES = new Set([
    BUNNY_STATUS.FINISHED,
    BUNNY_STATUS.RESOLUTION_FINISHED,
]);
