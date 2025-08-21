import { Router } from 'express';
import { RegionController } from '../controllers/regionController';
import {
  validateCreateRegion,
  validateUpdateRegion,
  validateRegionId,
  validatePointQuery,
  validateDistanceQuery,
  validateAddressQuery,
  validatePagination,
  validateSearchQuery,
} from '../middleware/validation';

const router = Router();
const regionController = new RegionController();

/**
 * @route   POST /api/regions
 * @desc    Create a new region
 * @access  Public
 */
router.post('/', validateCreateRegion, regionController.createRegion);

/**
 * @route   GET /api/regions
 * @desc    Get all regions with pagination
 * @access  Public
 */
router.get('/', validatePagination, regionController.getAllRegions);

/**
 * @route   GET /api/regions/search
 * @desc    Search regions by name
 * @access  Public
 */
router.get('/search', validateSearchQuery, regionController.searchRegionsByName);

/**
 * @route   GET /api/regions/point
 * @desc    Get regions containing a specific point
 * @access  Public
 */
router.get('/point', validatePointQuery, regionController.getRegionsContainingPoint);

/**
 * @route   GET /api/regions/distance
 * @desc    Get regions within a specific distance from a point
 * @access  Public
 */
router.get('/distance', validateDistanceQuery, regionController.getRegionsWithinDistance);

/**
 * @route   GET /api/regions/address
 * @desc    Get regions containing a specific address
 * @access  Public
 */
router.get('/address', validateAddressQuery, regionController.getRegionsByAddress);

/**
 * @route   GET /api/regions/:id
 * @desc    Get a region by ID
 * @access  Public
 */
router.get('/:id', validateRegionId, regionController.getRegionById);

/**
 * @route   PUT /api/regions/:id
 * @desc    Update a region
 * @access  Public
 */
router.put('/:id', validateUpdateRegion, regionController.updateRegion);

/**
 * @route   DELETE /api/regions/:id
 * @desc    Delete a region
 * @access  Public
 */
router.delete('/:id', validateRegionId, regionController.deleteRegion);

export default router;