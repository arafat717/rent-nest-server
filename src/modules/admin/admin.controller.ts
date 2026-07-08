import { Request, Response } from "express";
import httpsStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sentResponse } from "../../utils/sentResponse";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await adminService.getAllUsersFromDb();

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Users retrieved successfully!",
    data: users,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = await adminService.updateUserStatusIntoDb(id as string, status);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "User status updated successfully!",
    data: user,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const properties = await adminService.getAllPropertiesFromDb();

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Properties retrieved successfully!",
    data: properties,
  });
});

const getAllRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const requests = await adminService.getAllRentalRequestsFromDb();

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Rental requests retrieved successfully!",
    data: requests,
  });
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentalRequests,
};
