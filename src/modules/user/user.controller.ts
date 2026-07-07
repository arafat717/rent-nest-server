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

export const userController = {
  createUser,
};
