import userRepository from "./repository.js";
import dto from "./dto.js";

const getUsersList = async (keyword, status, page, limit) => {
    try {
        const { users, totalCount, nextPage } = await userRepository.getUsersList(keyword, status, page, limit);
        return {
            users: dto.formatUserList(users),
            totalCount,
            nextPage
        };
    } catch (error) {
        throw error;
    }
};

const getStudentById = async (id) => {
    try {
        const student = await userRepository.getStudentById(id);
        if (!student) return null;
        return dto.formatStudentDetail(student);
    } catch (error) {
        throw error;
    }
};

const deleteStudent = async (id) => {
    try {
        return await userRepository.deleteStudent(id);
    } catch (error) {
        throw error;
    }
};

const getStats = async () => {
    try {
        return await userRepository.getStats();
    } catch (error) {
        throw error;
    }
};

export default {
    getUsersList,
    getStudentById,
    deleteStudent,
    getStats
};
