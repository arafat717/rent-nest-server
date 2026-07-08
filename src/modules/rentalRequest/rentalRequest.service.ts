
import { prisma } from "../../lib/prisma";
import { TRentalRequest, TRentalRequestStatusUpdate } from "./rentalRequest.interface";

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
    include: { property: true, payment: true },
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
      tenant: { select: { id: true, name: true, email: true, phone: true } },
      payment: true,
    },
  });

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
  const requests = await prisma.rentalRequest.findMany({
    where: { property: { landlordId } },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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

  if (payload.status === "REJECTED" && !payload.rejectReason) {
    throw new Error("A reason is required to reject a rental request");
  }

  const updatedRequest = await prisma.rentalRequest.update({
    where: { id },
    data: {
      status: payload.status,
      rejectReason: payload.rejectReason,
    },
  });

  // When a landlord marks a rental completed, free up the property again
  if (payload.status === "COMPLETED") {
    await prisma.property.update({
      where: { id: request.propertyId },
      data: { status: "AVAILABLE" },
    });
  }

  return updatedRequest;
};

export const rentalRequestService = {
  createRentalRequestIntoDb,
  getMyRentalRequestsFromDb,
  getSingleRentalRequestFromDb,
  getLandlordRequestsFromDb,
  updateRentalRequestStatusIntoDb,
};
