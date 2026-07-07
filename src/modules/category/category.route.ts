import { Router } from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../utils/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.post("/", auth(Role.ADMIN), categoryController.createCategory);
router.patch("/:id", auth(Role.ADMIN), categoryController.updateCategory);
router.delete("/:id", auth(Role.ADMIN), categoryController.deleteCategory);

export const categoryRoute = router;
