import express from "express";
import courseController from "./controller.js";
import protect from "../../../../middlewares/adminAuth.middleware.js";
import validate from "../../../../middlewares/validate.middleware.js";
import courseValidation from "./validation.js";

const router = express.Router();

router.post("/create", protect, validate(courseValidation.createCourse), courseController.create);
router.post("/prepare-video-upload", protect, validate(courseValidation.prepareVideoUpload), courseController.prepareVideoUpload);
router.post("/add-lesson", protect, validate(courseValidation.createLesson), courseController.addLesson);
router.get("/", protect, courseController.getAll);
router.get("/:id", protect, courseController.getOne);
router.get("/play/:lessonId", protect, validate(courseValidation.playVideo), courseController.playVideo);
router.put("/:id", protect, validate(courseValidation.updateCourse), courseController.update);
router.delete("/:id", protect, courseController.deleteCourse);

export default router;