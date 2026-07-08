import { prisma } from "../../lib/prisma";
import {
  TRentalRequest,
  TRentalRequestStatusUpdate,
} from "./rentalRequest.interface";

const createRentalRequestIntoDb = async (
  tenantId: string,
  payload: TRentalRequest,
) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  if (property.status !== "AVAILABLE") {
    throw new Error("This property is not currently available");
  }

  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
    },
  });

  if (existingRequest) {
    throw new Error("You already have an active request for this property");
  }

  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      moveInDate: new Date(payload.moveInDate),
      moveOutDate: payload.moveOutDate ? new Date(payload.moveOutDate) : null,
      message: payload.message,
    },
  });

  return rentalRequest;
};

const getMyRentalRequestsFromDb = async (tenantId: string) => {
  const requests = await prisma.rentalRequest.findMany({
    where: { tenantId },
    include: { property: true },
    orderBy: { createdAt: "desc" },
  });

  return requests;
};

const getSingleRentalRequestFromDb = async (
  id: string,
  userId: string,
  role: string,
) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
      // payment: true,
    },
  });

  console.log("request", request);

  if (!request) {
    throw new Error("Rental request not found");
  }

  const isTenantOwner = request.tenantId === userId;
  const isLandlordOwner = request.property.landlordId === userId;

  if (role !== "ADMIN" && !isTenantOwner && !isLandlordOwner) {
    throw new Error("You are not allowed to view this rental request");
  }

  return request;
};

const getLandlordRequestsFromDb = async (landlordId: string) => {
  console.log("landlordId from rental get-->", landlordId);
  const requests = await prisma.rentalRequest.findMany({
    where: { property: { landlordId } },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  console.log("requests from rental get-->", requests);
  return requests;
};

const updateRentalRequestStatusIntoDb = async (
  id: string,
  landlordId: string,
  payload: TRentalRequestStatusUpdate,
) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true },
  });

  if (!request) {
    throw new Error("Rental request not found");
  }

  if (request.property.landlordId !== landlordId) {
    throw new Error("You are not allowed to update this rental request");
  }

  if (request.status !== "PENDING") {
    throw new Error(
      `Cannot ${payload.status.toLowerCase()} a request that is already ${request.status.toLowerCase()}`,
    );
  }

  if (payload.status === "REJECTED" && !payload.rejectReason) {
    throw new Error("A reason is required to reject a rental request");
  }

  const updatedRequest = await prisma.rentalRequest.update({
    where: { id },
    data: {
      status: payload.status,
      rejectReason: payload.status === "REJECTED" ? payload.rejectReason : null,
    },
  });

  return updatedRequest;
};

const completeRentalRequestIntoDb = async (id: string, landlordId: string) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true },
  });

  if (!request) {
    throw new Error("Rental request not found");
  }

  if (request.property.landlordId !== landlordId) {
    throw new Error("You are not allowed to update this rental request");
  }

  // Without payment integration, a completed rental can be marked directly
  // from APPROVED. Once payment is added, gate this behind status === "ACTIVE".
  if (request.status !== "APPROVED" && request.status !== "ACTIVE") {
    throw new Error(
      "Only an approved or active rental request can be marked as completed",
    );
  }

  const updatedRequest = await prisma.rentalRequest.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  // Free up the property again once the rental is done
  await prisma.property.update({
    where: { id: request.propertyId },
    data: { status: "AVAILABLE" },
  });

  return updatedRequest;
};

export const rentalRequestService = {
  createRentalRequestIntoDb,
  getMyRentalRequestsFromDb,
  getSingleRentalRequestFromDb,
  getLandlordRequestsFromDb,
  updateRentalRequestStatusIntoDb,
  completeRentalRequestIntoDb,
};
