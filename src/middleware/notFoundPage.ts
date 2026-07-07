export const notFoundPage = (req: any, res: any, next: any) => {
  res.status(404).json({
    success: false,
    path: req.originalUrl,
    message: "Page not found!",
    date: Date(),
  });
};
