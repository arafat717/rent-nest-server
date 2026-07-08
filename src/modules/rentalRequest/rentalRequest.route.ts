import { Router } from "express";
import { auth } from "../../utils/auth";
import { rentalRequestController } from "./rentalRequest.controller";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// POST /api/rentals - tenant submits a request
router.post(
  "/",
  auth(Role.TENANT),
  rentalRequestController.createRentalRequest,
);

// GET /api/rentals - tenant's own requests
router.get("/", auth(Role.TENANT), rentalRequestController.getMyRentalRequests);

// GET /api/rentals/:id - request details (tenant, landlord, or admin)

// rentals

router.get(
  "/requests",
  auth(Role.LANDLORD),
  rentalRequestController.getLandlordRequests,
);
router.get(
  "/:id",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  rentalRequestController.getSingleRentalRequest,
);
router.patch(
  "/requests/:id",
  auth(Role.LANDLORD),
  rentalRequestController.updateRentalRequestStatus,
);

router.patch(
  "/requests/:id/complete",
  auth(Role.LANDLORD),
  rentalRequestController.completeRentalRequest,
);

export const rentalRequestRoute = router;
