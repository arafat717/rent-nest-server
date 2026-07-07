import { Request, Response } from "express";
import httpsStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sentResponse } from "../../utils/sentResponse";
import { userService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = await userService.createUserIntoDb(payload);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.CREATED,
    message: "User register successfully!",
    data: user,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await userService.loginUserFromDb(payload);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
  });
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "User logged in successfully!",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await userService.getMeFromDb(userId);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "User retrieved successfully!",
    data: user,
  });
});

export const userController = {
  createUser,
  loginUser,
  getMe,
};
