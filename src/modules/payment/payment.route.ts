import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../utils/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// POST /api/payments/create
router.post("/create", auth(Role.TENANT), paymentController.createPayment);

// POST /api/payments/confirm
router.post("/confirm", auth(Role.TENANT), paymentController.confirmPayment);

// GET /api/payments
router.get("/", auth(Role.TENANT), paymentController.getMyPayments);

// GET /api/payments/:id
router.get(
  "/:id",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  paymentController.getSinglePayment,
);

export const paymentRoute = router;
