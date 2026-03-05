// Function to map the query string into a structured filter object
const dashboardDTO = (query) => {
    const filters = {};

    if (query.startDate) {
        filters.startDate = new Date(query.startDate);
    }

    if (query.endDate) {
        filters.endDate = new Date(query.endDate);
        // Ensure endDate includes the entire day
        filters.endDate.setHours(23, 59, 59, 999);
    }

    if (query.category) {
        filters.category = query.category;
    }

    return filters;
};

export default {
    dashboardDTO,
};
