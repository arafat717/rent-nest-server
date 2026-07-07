import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { userRoute } from "./modules/user/user.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFoundPage } from "./middleware/notFoundPage";
import { categoryRoute } from "./modules/category/category.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.get("/", async (req: Request, res: Response) => {
  res.send("Rent nest server running!");
});

// STRIP_PRODUCT_ID=prod_UomtroxhuY6R36

app.use("/api/users", userRoute);
app.use("/api/category", categoryRoute);

app.use(notFoundPage);
app.use(globalErrorHandler);

export default app;
