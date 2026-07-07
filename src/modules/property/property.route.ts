import { Router } from "express";
import { propertyController } from "./property.controller";

const router = Router();

// GET /api/properties - public, with filters
router.get("/", propertyController.getAllProperties);

// GET /api/properties/:id - public
router.get("/:id", propertyController.getSingleProperty);

export const propertyRoute = router;
