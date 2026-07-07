import { Request, Response } from "express";
import httpsStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sentResponse } from "../../utils/sentResponse";
import { propertyService } from "./property.service";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user!.id;
  const payload = req.body;
  const property = await propertyService.createPropertyIntoDb(
    landlordId,
    payload,
  );

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.CREATED,
    message: "Property listed successfully!",
    data: property,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await propertyService.getAllPropertiesFromDb(filters);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Properties retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const property = await propertyService.getSinglePropertyFromDb(id as string);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Property retrieved successfully!",
    data: property,
  });
});

const getMyProperties = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user!.id;
  const properties = await propertyService.getMyPropertiesFromDb(landlordId);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Your properties retrieved successfully!",
    data: properties,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const landlordId = req.user!.id;
  const payload = req.body;
  const property = await propertyService.updatePropertyIntoDb(
    id as string,
    landlordId,
    payload,
  );

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Property updated successfully!",
    data: property,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const landlordId = req.user!.id;
  await propertyService.deletePropertyFromDb(id as string, landlordId);

  sentResponse(res, {
    success: true,
    statusCode: httpsStatus.OK,
    message: "Property deleted successfully!",
    data: null,
  });
});

export const propertyController = {
  createProperty,
  getAllProperties,
  getSingleProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
