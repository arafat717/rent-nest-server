import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../utils/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.get(
  "/me",
  auth(Role.TENANT, Role.ADMIN, Role.LANDLORD),
  userController.getMe,
);

router.patch(
  "/me",
  auth("TENANT", "LANDLORD", "ADMIN"),
  userController.updateMe,
);

export const userRoute = router;
