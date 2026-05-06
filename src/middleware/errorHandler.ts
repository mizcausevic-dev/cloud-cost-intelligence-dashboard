import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  next(new HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
}

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;

  response.status(statusCode).json({
    error: {
      message: statusCode === 500 ? "Unexpected server error." : error.message,
      statusCode,
    },
  });
}
