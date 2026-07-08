import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../utils/auth";
import { Role } from "../../../generated/prisma/enums";
const router = Router();

router.post("/", auth(Role.TENANT), reviewController.createReview);
router.get("/property/:propertyId", reviewController.getPropertyReviews);

export const reviewRoute = router;
