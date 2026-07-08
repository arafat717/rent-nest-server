import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../utils/auth";
import { Role } from "../../../generated/prisma/enums";
const router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.patch("/users/:id", auth(Role.ADMIN), adminController.updateUserStatus);
router.get("/properties", auth(Role.ADMIN), adminController.getAllProperties);
router.get("/rentals", auth(Role.ADMIN), adminController.getAllRentalRequests);

export const adminRoute = router;
