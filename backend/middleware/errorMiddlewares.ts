import { Request, Response, NextFunction } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    console.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  } else {
    console.error(
      `${req.method} ${req.originalUrl} - ${err.message}\n${err.stack}`
    );
  }

  res.json({
    message: err.message,
    stack: env === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };
