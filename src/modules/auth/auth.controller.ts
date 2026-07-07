import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sentResponse } from "../../utils/sentResponse";
import httpsStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";

const loginUser = async (req: Request, res: Response) => {
  const payload = req.body;
  const { accessToken, refreshToken } =
    await authService.loginUserIntoDb(payload);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.CREATED,
    message: "User login successfully!",
    data: { accessToken, refreshToken },
  });
};

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await authService.getMyProfileIntoDb(user?.id as string);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.CREATED,
    message: "User register successfully!",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const userId = req.user?.id;
  const result = await authService.updateProfileIntoDb(userId as string, data);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.CREATED,
    message: "User updated successfully!",
    data: result,
  });
});

const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const {accessToken} = await authService.refreshTokenIntoDb(refreshToken);

    res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
  });

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.CREATED,
    message: "Rrefresh token genarated successfully!",
    data: accessToken,
  });
});

export const authController = {
  loginUser,
  getMyProfile,
  updateProfile,
  refreshAccessToken,
};
