import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Validation failed',
      message: errors.array().map(err => err.msg).join(', '),
    };
    res.status(400).json(response);
    return;
  }
  next();
};

export const validateCreateRegion = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('coordinates')
    .notEmpty()
    .withMessage('Coordinates are required'),
  
  body('coordinates.type')
    .equals('Polygon')
    .withMessage('Coordinates type must be Polygon'),
  
  body('coordinates.coordinates')
    .isArray({ min: 1 })
    .withMessage('Coordinates must be an array with at least one ring'),
  
  body('coordinates.coordinates.0')
    .isArray({ min: 4 })
    .withMessage('Polygon ring must have at least 4 coordinates'),
  
  body('coordinates.coordinates.0.*')
    .isArray({ min: 2, max: 2 })
    .withMessage('Each coordinate must be an array of [longitude, latitude]'),
  
  body('coordinates.coordinates.0.*.0')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('coordinates.coordinates.0.*.1')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  handleValidationErrors,
];

export const validateUpdateRegion = [
  param('id')
    .isMongoId()
    .withMessage('Invalid region ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('coordinates')
    .optional(),
  
  body('coordinates.type')
    .optional()
    .equals('Polygon')
    .withMessage('Coordinates type must be Polygon'),
  
  body('coordinates.coordinates')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Coordinates must be an array with at least one ring'),
  
  handleValidationErrors,
];

export const validateRegionId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid region ID'),
  
  handleValidationErrors,
];

export const validatePointQuery = [
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  handleValidationErrors,
];

export const validateDistanceQuery = [
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  query('distance')
    .isFloat({ min: 1 })
    .withMessage('Distance must be a positive number in meters'),
  
  handleValidationErrors,
];

export const validateAddressQuery = [
  query('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Address must be between 3 and 200 characters'),
  
  query('countryCode')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters')
    .isAlpha()
    .withMessage('Country code must contain only letters'),
  
  handleValidationErrors,
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors,
];

export const validateSearchQuery = [
  query('name')
    .trim()
    .notEmpty()
    .withMessage('Search name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search name must be between 1 and 100 characters'),
  
  ...validatePagination,
];

