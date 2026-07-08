import { Router } from "express";
import { auth } from "../../utils/auth";
import { rentalRequestController } from "./rentalRequest.controller";

const router = Router();

// POST /api/rentals - tenant submits a request
router.post("/", auth("TENANT"), rentalRequestController.createRentalRequest);

// GET /api/rentals - tenant's own requests
router.get("/", auth("TENANT"), rentalRequestController.getMyRentalRequests);

// GET /api/rentals/:id - request details (tenant, landlord, or admin)
router.get(
  "/:id",
  auth("TENANT", "LANDLORD", "ADMIN"),
  rentalRequestController.getSingleRentalRequest,
);

export const rentalRequestRoute = router;
