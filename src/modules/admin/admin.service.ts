import { prisma } from "../../lib/prisma";

const getAllUsersFromDb = async () => {
  const users = await prisma.user.findMany({
    omit: { password: true },
    orderBy: { createdAt: "desc" },
  });

  return users;
};

const updateUserStatusIntoDb = async (
  id: string,
  status: "ACTIVE" | "BANNED",
) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "ADMIN") {
    throw new Error("You cannot change the status of an admin account");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status },
    omit: { password: true },
  });

  return updatedUser;
};

const getAllPropertiesFromDb = async () => {
  const properties = await prisma.property.findMany({
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return properties;
};

const getAllRentalRequestsFromDb = async () => {
  const requests = await prisma.rentalRequest.findMany({
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests;
};

export const adminService = {
  getAllUsersFromDb,
  updateUserStatusIntoDb,
  getAllPropertiesFromDb,
  getAllRentalRequestsFromDb,
};
