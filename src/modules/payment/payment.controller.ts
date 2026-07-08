import { Request, Response } from "express";
import httpsStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sentResponse } from "../../utils/sentResponse";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const payload = req.body;
  const result = await paymentService.createPaymentIntoDb(tenantId, payload);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.CREATED,
    message: "Payment intent created successfully!",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const payload = req.body;
  const payment = await paymentService.confirmPaymentIntoDb(tenantId, payload);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Payment confirmed successfully!",
    data: payment,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const payments = await paymentService.getMyPaymentsFromDb(tenantId);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Payment history retrieved successfully!",
    data: payments,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const role = req.user!.role;
  const payment = await paymentService.getSinglePaymentFromDb(
    id as string,
    userId,
    role,
  );

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Payment retrieved successfully!",
    data: payment,
  });
});

export const paymentController = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getSinglePayment,
};
