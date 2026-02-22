const success = (message, data, statusCode = 200) => {
    return {
        success: true,
        message,
        code: statusCode,
        data,
    };
};

const error = (message, statusCode = 500) => {
    return {
        success: false,
        message,
        code: statusCode,
    };
};

export default {
    success,
    error,
};
