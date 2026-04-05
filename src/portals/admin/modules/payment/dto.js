const formatPayment = (payment) => {
    return {
        _id: payment._id,
        transactionId: payment.paymentId || "N/A",
        student: {
            name: payment.student?.name,
            lastName: payment.student?.lastName || "",
            method: payment.paymentMethod || "N/A",
            avatar: payment.student?.avatar || null
        },
        course: {
            name: payment.course?.name || "N/A",
            category: "General" // Or any other field from course if available
        },
        amount: payment.amountPaid,
        date: payment.enrolledAt,
        status: payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)
    };
};

const formatPaymentList = (payments) => {
    return (payments || []).map(formatPayment);
};

export default {
    formatPaymentList,
    formatPayment
};
