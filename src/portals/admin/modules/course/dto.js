// Function to map the request body to a Course Data Transfer Object (DTO)
const createCourseDTO = (reqBody, userId) => {
    return {
        name: reqBody.name,
        description: reqBody.description,
        thumbnail: reqBody.thumbnail,
        price: reqBody.price,
        category: reqBody.category,
        features: reqBody.features,
        instructorName: reqBody.instructorName,
        status: reqBody.status,
        createdBy: userId,
    };
};

const updateCourseDTO = (reqBody, adminId) => {
    const dto = {};
    if (reqBody.name !== undefined) dto.name = reqBody.name;
    if (reqBody.description !== undefined) dto.description = reqBody.description;
    if (reqBody.thumbnail !== undefined) dto.thumbnail = reqBody.thumbnail;
    if (reqBody.price !== undefined) dto.price = reqBody.price;
    if (reqBody.category !== undefined) dto.category = reqBody.category;
    if (reqBody.features !== undefined) dto.features = reqBody.features;
    if (reqBody.instructorName !== undefined) dto.instructorName = reqBody.instructorName;
    if (reqBody.status !== undefined) dto.status = reqBody.status;

    // Add updatedBy field to track who last updated it
    dto.updatedBy = adminId;

    return dto;
};

export default {
    createCourseDTO,
    updateCourseDTO,
};
