import { Request, Response } from 'express';
import { RegionService } from '../services/regionService';
import { GeocodingService } from '../services/geocodingService';
import { ApiResponse, CreateRegionRequest, UpdateRegionRequest, PointQuery, DistanceQuery, AddressQuery, PaginationQuery } from '../types';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class RegionController {
  private regionService: RegionService;
  private geocodingService: GeocodingService;

  constructor() {
    this.regionService = new RegionService();
    this.geocodingService = new GeocodingService();
  }

  createRegion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const regionData: CreateRegionRequest = req.body;
    
    const region = await this.regionService.createRegion(regionData);
    
    const response: ApiResponse<typeof region> = {
      success: true,
      data: region,
      message: 'Region created successfully',
    };
    
    res.status(201).json(response);
  });

  getAllRegions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pagination: PaginationQuery = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    
    const result = await this.regionService.getAllRegions(pagination);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Regions retrieved successfully',
    };
    
    res.json(response);
  });

  getRegionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const region = await this.regionService.getRegionById(id);
    
    if (!region) {
      throw createError('Region not found', 404);
    }
    
    const response: ApiResponse<typeof region> = {
      success: true,
      data: region,
      message: 'Region retrieved successfully',
    };
    
    res.json(response);
  });

  updateRegion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: UpdateRegionRequest = req.body;
    
    const region = await this.regionService.updateRegion(id, updateData);
    
    if (!region) {
      throw createError('Region not found', 404);
    }
    
    const response: ApiResponse<typeof region> = {
      success: true,
      data: region,
      message: 'Region updated successfully',
    };
    
    res.json(response);
  });

  deleteRegion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const deleted = await this.regionService.deleteRegion(id);
    
    if (!deleted) {
      throw createError('Region not found', 404);
    }
    
    const response: ApiResponse<null> = {
      success: true,
      message: 'Region deleted successfully',
    };
    
    res.json(response);
  });

  getRegionsContainingPoint = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const point: PointQuery = {
      longitude: parseFloat(req.query.longitude as string),
      latitude: parseFloat(req.query.latitude as string),
    };
    
    const regions = await this.regionService.getRegionsContainingPoint(point);
    
    const response: ApiResponse<typeof regions> = {
      success: true,
      data: regions,
      message: `Found ${regions.length} regions containing the specified point`,
    };
    
    res.json(response);
  });

  getRegionsWithinDistance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query: DistanceQuery = {
      longitude: parseFloat(req.query.longitude as string),
      latitude: parseFloat(req.query.latitude as string),
      distance: parseFloat(req.query.distance as string),
    };
    
    const regions = await this.regionService.getRegionsWithinDistance(query);
    
    const response: ApiResponse<typeof regions> = {
      success: true,
      data: regions,
      message: `Found ${regions.length} regions within ${query.distance} meters`,
    };
    
    res.json(response);
  });

  getRegionsByAddress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const addressQuery: AddressQuery = {
      address: req.query.address as string,
      countryCode: req.query.countryCode as string,
    };
    
    // First, geocode the address to get coordinates
    const geocodeResult = await this.geocodingService.geocodeAddress(
      addressQuery.address,
      addressQuery.countryCode
    );
    
    // Then find regions containing those coordinates
    const point: PointQuery = {
      longitude: geocodeResult.longitude,
      latitude: geocodeResult.latitude,
    };
    
    const regions = await this.regionService.getRegionsContainingPoint(point);
    
    logger.info('Address geocoded and regions found', {
      address: addressQuery.address,
      geocodeResult,
      regionsFound: regions.length,
    });
    
    const response: ApiResponse<{
      geocodeResult: typeof geocodeResult;
      regions: typeof regions;
    }> = {
      success: true,
      data: {
        geocodeResult,
        regions,
      },
      message: `Address geocoded successfully. Found ${regions.length} regions containing this location.`,
    };
    
    res.json(response);
  });

  searchRegionsByName = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const name = req.query.name as string;
    const pagination: PaginationQuery = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    
    const result = await this.regionService.searchRegionsByName(name, pagination);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: `Found ${result.data.length} regions matching "${name}"`,
    };
    
    res.json(response);
  });
}