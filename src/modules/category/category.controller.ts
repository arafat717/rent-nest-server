import { Request, Response } from "express";
import httpsStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sentResponse } from "../../utils/sentResponse";
import { categoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const category = await categoryService.createCategoryIntoDb(payload);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.CREATED,
    message: "Category created successfully!",
    data: category,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategoriesFromDb();

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Categories retrieved successfully!",
    data: categories,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const category = await categoryService.updateCategoryIntoDb(
    id as string,
    payload,
  );

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Category updated successfully!",
    data: category,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await categoryService.deleteCategoryFromDb(id as string);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Category deleted successfully!",
    data: null,
  });
});

export const categoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
