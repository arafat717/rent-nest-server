import { Router } from "express";
import { propertyController } from "./property.controller";
import { auth } from "../../utils/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// GET /api/properties - public, with filters
router.get("/", propertyController.getAllProperties);
router.post("/", auth(Role.LANDLORD), propertyController.createProperty);
router.put("/:id", auth(Role.LANDLORD), propertyController.updateProperty);
router.delete("/:id", auth(Role.LANDLORD), propertyController.deleteProperty);

// GET /api/properties/:id - public
router.get("/:id", propertyController.getSingleProperty);

export const propertyRoute = router;
