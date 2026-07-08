import { prisma } from "../../lib/prisma";
import { TReview } from "./review.interface";

const createReviewIntoDb = async (tenantId: string, payload: TReview) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: { review: true },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new Error("You are not allowed to review this rental");
  }

  if (rentalRequest.status !== "COMPLETED") {
    throw new Error("You can only review a completed rental");
  }

  if (rentalRequest.review) {
    throw new Error("You have already reviewed this rental");
  }

  if (payload.rating < 1 || payload.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const review = await prisma.review.create({
    data: {
      tenantId,
      propertyId: rentalRequest.propertyId,
      rentalRequestId: payload.rentalRequestId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  return review;
};

const getPropertyReviewsFromDb = async (propertyId: string) => {
  const reviews = await prisma.review.findMany({
    where: { propertyId },
    include: { tenant: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

export const reviewService = {
  createReviewIntoDb,
  getPropertyReviewsFromDb,
};
