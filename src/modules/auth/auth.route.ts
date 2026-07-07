import { Router } from "express";
import { authController } from "./auth.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../utils/auth";

const router = Router();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}

// check token
// verify token
//

router.post("/login", authController.loginUser);
router.get(
  "/me",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  authController.getMyProfile,
);

router.put(
  "/my-profile",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  authController.updateProfile,
);

router.get("/refresh-token", authController.refreshAccessToken);

export const authRoute = router;
