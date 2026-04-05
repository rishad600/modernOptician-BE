import express from "express";
import paymentController from "./controller.js";
import paymentValidation from "./validation.js";
import validate from "../../../../middlewares/validate.middleware.js";
import protect from "../../../../middlewares/adminAuth.middleware.js";

const router = express.Router();

router.get("/stats", protect, paymentController.getStats);
router.get("/list", protect, validate(paymentValidation.getList), paymentController.getList);

export default router;
