import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { userRoute } from "./modules/user/user.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFoundPage } from "./middleware/notFoundPage";
import { categoryRoute } from "./modules/category/category.route";
import { propertyRoute } from "./modules/property/property.route";
import { rentalRequestRoute } from "./modules/rentalRequest/rentalRequest.route";
import { reviewRoute } from "./modules/review/review.route";
import { adminRoute } from "./modules/admin/admin.route";
import { paymentRoute } from "./modules/payment/payment.route";

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


app.use("/api/users", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/properties", propertyRoute);
app.use("/api/rentals", rentalRequestRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/admin", adminRoute);
app.use("/api/payments", paymentRoute);

app.use(notFoundPage);
app.use(globalErrorHandler);

export default app;
