import { prisma } from "../../lib/prisma";
import { TProperty, TPropertyFilters } from "./property.interface";

const createPropertyIntoDb = async (landlordId: string, payload: TProperty) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const property = await prisma.property.create({
    data: {
      ...payload,
      landlordId,
    },
  });

  return property;
};

const getAllPropertiesFromDb = async (filters: TPropertyFilters) => {
  const { city, location, type, minPrice, maxPrice, amenities, page, limit } =
    filters;

  const pageNumber = Number(page) || 1;
  const pageSize = Number(limit) || 10;

  const where: any = {
    status: "AVAILABLE",
  };

  if (city) where.city = { contains: city, mode: "insensitive" };
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (type) where.type = type;
  if (amenities) where.amenities = { hasSome: amenities.split(",") };

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        category: true,
        landlord: { select: { id: true, name: true } },
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    meta: { page: pageNumber, limit: pageSize, total },
    data: properties,
  };
};

const getSinglePropertyFromDb = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      landlord: { select: { id: true, name: true, phone: true, email: true } },
      reviews: { include: { tenant: { select: { id: true, name: true } } } },
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  return property;
};

const getMyPropertiesFromDb = async (landlordId: string) => {
  const properties = await prisma.property.findMany({
    where: { landlordId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return properties;
};

const updatePropertyIntoDb = async (
  id: string,
  landlordId: string,
  payload: Partial<TProperty>,
) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw new Error("Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new Error("You are not allowed to update this property");
  }

  const updatedProperty = await prisma.property.update({
    where: { id },
    data: payload,
  });

  return updatedProperty;
};

const deletePropertyFromDb = async (id: string, landlordId: string) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw new Error("Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new Error("You are not allowed to delete this property");
  }

  await prisma.property.delete({ where: { id } });

  return null;
};

export const propertyService = {
  createPropertyIntoDb,
  getAllPropertiesFromDb,
  getSinglePropertyFromDb,
  getMyPropertiesFromDb,
  updatePropertyIntoDb,
  deletePropertyFromDb,
};
