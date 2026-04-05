import express from "express";
import studentController from "./controller.js";
import studentValidation from "./validation.js";
import validate from "../../../../middlewares/validate.middleware.js";
import protect from "../../../../middlewares/adminAuth.middleware.js";

const router = express.Router();

router.get("/", protect, validate(studentValidation.getUsersList), studentController.getUsersList);
router.get("/stats", protect, studentController.getStats);
router.get("/:id", protect, studentController.getStudentById);
router.delete("/:id", protect, studentController.deleteStudent);

export default router;
