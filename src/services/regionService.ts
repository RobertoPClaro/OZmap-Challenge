import { Region, RegionDocument } from '../models/Region';
import { CreateRegionRequest, UpdateRegionRequest, PointQuery, DistanceQuery, PaginatedResponse, PaginationQuery } from '../types';
import { logger } from '../utils/logger';

export class RegionService {
  async createRegion(regionData: CreateRegionRequest): Promise<RegionDocument> {
    try {
      const region = new Region(regionData);
      const savedRegion = await region.save();
      
      logger.info('Region created successfully', {
        regionId: savedRegion._id,
        name: savedRegion.name,
      });
      
      return savedRegion;
    } catch (error) {
      logger.error('Failed to create region', {
        regionData,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getAllRegions(pagination: PaginationQuery = {}): Promise<PaginatedResponse<RegionDocument>> {
    try {
      const page = Math.max(1, pagination.page || 1);
      const limit = Math.min(100, Math.max(1, pagination.limit || 10));
      const skip = (page - 1) * limit;

      const [regions, total] = await Promise.all([
        Region.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
        Region.countDocuments(),
      ]);

      const totalPages = Math.ceil(total / limit);

      logger.info('Regions retrieved successfully', {
        page,
        limit,
        total,
        totalPages,
      });

      return {
        data: regions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Failed to retrieve regions', {
        pagination,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getRegionById(id: string): Promise<RegionDocument | null> {
    try {
      const region = await Region.findById(id);
      
      if (region) {
        logger.info('Region retrieved successfully', {
          regionId: id,
          name: region.name,
        });
      } else {
        logger.warn('Region not found', { regionId: id });
      }
      
      return region;
    } catch (error) {
      logger.error('Failed to retrieve region', {
        regionId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async updateRegion(id: string, updateData: UpdateRegionRequest): Promise<RegionDocument | null> {
    try {
      const region = await Region.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (region) {
        logger.info('Region updated successfully', {
          regionId: id,
          name: region.name,
          updateData,
        });
      } else {
        logger.warn('Region not found for update', { regionId: id });
      }
      
      return region;
    } catch (error) {
      logger.error('Failed to update region', {
        regionId: id,
        updateData,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async deleteRegion(id: string): Promise<boolean> {
    try {
      const result = await Region.findByIdAndDelete(id);
      
      if (result) {
        logger.info('Region deleted successfully', {
          regionId: id,
          name: result.name,
        });
        return true;
      } else {
        logger.warn('Region not found for deletion', { regionId: id });
        return false;
      }
    } catch (error) {
      logger.error('Failed to delete region', {
        regionId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getRegionsContainingPoint(point: PointQuery): Promise<RegionDocument[]> {
    try {
      const regions = await Region.find({
        coordinates: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: [point.longitude, point.latitude],
            },
          },
        },
      });

      logger.info('Regions containing point retrieved successfully', {
        point,
        count: regions.length,
      });

      return regions;
    } catch (error) {
      logger.error('Failed to find regions containing point', {
        point,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getRegionsWithinDistance(query: DistanceQuery): Promise<RegionDocument[]> {
    try {
      const regions = await Region.find({
        coordinates: {
          $geoWithin: {
            $centerSphere: [
              [query.longitude, query.latitude],
              query.distance / 6378100, // Convert meters to radians (Earth radius in meters)
            ],
          },
        },
      });

      logger.info('Regions within distance retrieved successfully', {
        query,
        count: regions.length,
      });

      return regions;
    } catch (error) {
      logger.error('Failed to find regions within distance', {
        query,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async searchRegionsByName(name: string, pagination: PaginationQuery = {}): Promise<PaginatedResponse<RegionDocument>> {
    try {
      const page = Math.max(1, pagination.page || 1);
      const limit = Math.min(100, Math.max(1, pagination.limit || 10));
      const skip = (page - 1) * limit;

      const searchQuery = {
        name: { $regex: name, $options: 'i' },
      };

      const [regions, total] = await Promise.all([
        Region.find(searchQuery).skip(skip).limit(limit).sort({ createdAt: -1 }),
        Region.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(total / limit);

      logger.info('Regions search completed successfully', {
        searchTerm: name,
        page,
        limit,
        total,
        totalPages,
      });

      return {
        data: regions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Failed to search regions by name', {
        searchTerm: name,
        pagination,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

