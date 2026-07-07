import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "./catchAsync";
import { jwtUtils } from "./jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const auth = (...userRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;
    if (!token) {
      throw new Error(
        "You are not logged in. Please login to access this resource.",
      );
    }
    const verifyedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifyedToken.success) {
      throw new Error(verifyedToken.error);
    }
    const { email, name, role, id } = verifyedToken.data as JwtPayload;
    if (!userRoles.length && userRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message:
          "Frobidden. You don't have permission to access this resource.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        role,
        name,
        email,
      },
    });

    if (!user) {
      throw new Error("User not found. Please login agin.");
    }

    if (user.activeStatus === "BLOCKED") {
      throw new Error("Your account has been blocked. Please contact support.");
    }

    req.user = {
      id,
      name,
      email,
      role,
    };

    next();
  });
};
