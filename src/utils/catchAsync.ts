import { NextFunction, Request, RequestHandler, Response } from "express";
import httpsStatus from "http-status-codes";

export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err: any) {
      // res.status(httpsStatus.INTERNAL_SERVER_ERROR).json({
      //   success: false,
      //   statusCode: httpsStatus.INTERNAL_SERVER_ERROR,
      //   message: "Something went wrong!",
      //   error: err.message,
      // });
      next(err);
    }
  };
};
