import { Request, Response } from "express";
import httpsStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sentResponse } from "../../utils/sentResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const payload = req.body;
  const review = await reviewService.createReviewIntoDb(tenantId, payload);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.CREATED,
    message: "Review submitted successfully!",
    data: review,
  });
});

const getPropertyReviews = catchAsync(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const reviews = await reviewService.getPropertyReviewsFromDb(
    propertyId as string,
  );

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Reviews retrieved successfully!",
    data: reviews,
  });
});

export const reviewController = {
  createReview,
  getPropertyReviews,
};
