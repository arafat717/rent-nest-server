import { prisma } from "../../lib/prisma";
import { TCategory } from "./category.interface";

const createCategoryIntoDb = async (payload: TCategory) => {
  const isCategoryExists = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (isCategoryExists) {
    throw new Error("Category with this name already exists");
  }

  const category = await prisma.category.create({
    data: payload,
  });

  return category;
};

const getAllCategoriesFromDb = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return categories;
};

const updateCategoryIntoDb = async (
  id: string,
  payload: Partial<TCategory>,
) => {
  const isCategoryExists = await prisma.category.findUnique({
    where: { id },
  });

  if (!isCategoryExists) {
    throw new Error("Category not found");
  }

  const category = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return category;
};

const deleteCategoryFromDb = async (id: string) => {
  const isCategoryExists = await prisma.category.findUnique({
    where: { id },
  });

  if (!isCategoryExists) {
    throw new Error("Category not found");
  }

  await prisma.category.delete({
    where: { id },
  });

  return null;
};

export const categoryService = {
  createCategoryIntoDb,
  getAllCategoriesFromDb,
  updateCategoryIntoDb,
  deleteCategoryFromDb,
};
