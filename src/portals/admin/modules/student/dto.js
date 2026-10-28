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
    // Repository now returns `enrollments` (from Enrollment collection), not the
    // removed User.enrolledCourses embedded array.
    return {
        ...formatUser(user),
        enrolledCourses: (user.enrollments || []).map(e => ({
            courseId: e.courseId,
            courseName: e.courseName || "N/A",
            amountPaid: e.amountPaid || 0,
            enrolledAt: e.enrolledAt,
            paymentStatus: e.paymentStatus || "pending",
            isCompleted: e.isCompleted || false,
            completedAt: e.completedAt || null,
        }))
    };
};

export default {
    formatUserList,
    formatUser,
    formatStudentDetail
};
