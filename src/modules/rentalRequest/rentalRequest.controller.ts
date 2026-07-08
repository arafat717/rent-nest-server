import { Request, Response } from "express";
import httpsStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sentResponse } from "../../utils/sentResponse";
import { rentalRequestService } from "./rentalRequest.service";

const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const payload = req.body;
  const rentalRequest = await rentalRequestService.createRentalRequestIntoDb(
    tenantId,
    payload,
  );

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.CREATED,
    message: "Rental request submitted successfully!",
    data: rentalRequest,
  });
});

const getMyRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const requests =
    await rentalRequestService.getMyRentalRequestsFromDb(tenantId);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Rental requests retrieved successfully!",
    data: requests,
  });
});

const getSingleRentalRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;
    const request = await rentalRequestService.getSingleRentalRequestFromDb(
      id as string,
      userId,
      role,
    );

    sentResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: "Rental request retrieved successfully!",
      data: request,
    });
  },
);

const getLandlordRequests = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user!.id;
  const requests =
    await rentalRequestService.getLandlordRequestsFromDb(landlordId);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Rental requests retrieved successfully!",
    data: requests,
  });
});

const updateRentalRequestStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const landlordId = req.user!.id;
    const payload = req.body;
    const request = await rentalRequestService.updateRentalRequestStatusIntoDb(
      id as string,
      landlordId,
      payload,
    );

    sentResponse(res, {
      success: true,
      statusCode: httpsStatus.OK,
      message: `Rental request ${payload.status.toLowerCase()} successfully!`,
      data: request,
    });
  },
);

export const rentalRequestController = {
  createRentalRequest,
  getMyRentalRequests,
  getSingleRentalRequest,
  getLandlordRequests,
  updateRentalRequestStatus,
};
