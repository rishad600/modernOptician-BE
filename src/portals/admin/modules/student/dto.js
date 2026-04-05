const formatUser = (user) => {
    return {
        _id: user._id,
        student: {
            name: user.name || "",
            lastName: user.lastName || "",
            email: user.email || "",
        },
        studentId: user.studentId || "",
        joined: user.createdAt,
        courses: user.coursesCount || 0,
        totalSpent: user.totalSpent || 0,
        status: user.isTrash ? "Inactive" : "Active"
    };
};

const formatUserList = (users) => {
    return users.map(formatUser);
};

const formatStudentDetail = (user) => {
    return {
        ...formatUser(user),
        enrolledCourses: (user.enrolledCourses || []).map(course => ({
            courseId: course.courseId,
            courseName: course.courseName || "N/A",
            amountPaid: course.amountPaid || 0,
            enrolledAt: course.enrolledAt,
            paymentStatus: course.paymentStatus || "pending",
            isCompleted: course.isCompleted || false,
            completedAt: course.completedAt || null
        }))
    };
};

export default {
    formatUserList,
    formatUser,
    formatStudentDetail
};
