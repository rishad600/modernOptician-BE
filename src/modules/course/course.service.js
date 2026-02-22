import courseRepository from './course.repository.js';

class CourseService {
    async createCourse(courseData) {
        return await courseRepository.create(courseData);
    }

    async getAllCourses() {
        return await courseRepository.findAll();
    }

    async getCourseById(id) {
        return await courseRepository.findById(id);
    }

    async updateCourse(id, updateData) {
        return await courseRepository.update(id, updateData);
    }

    async deleteCourse(id) {
        return await courseRepository.delete(id);
    }
}

export default new CourseService();
