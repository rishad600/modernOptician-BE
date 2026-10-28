import userRepository from "./repository.js";
import dto from "./dto.js";

const getUsersList = async (keyword, status, page, limit) => {
    const { users, totalCount, nextPage } = await userRepository.getUsersList(keyword, status, page, limit);
    return { users: dto.formatUserList(users), totalCount, nextPage };
};

const getStudentById = async (id) => {
    const student = await userRepository.getStudentById(id);
    if (!student) return null;
    return dto.formatStudentDetail(student);
};

const deleteStudent = async (id) => userRepository.deleteStudent(id);
const getStats = async () => userRepository.getStats();

export default {
    getUsersList,
    getStudentById,
    deleteStudent,
    getStats,
};
