import axios from 'axios';
import { GeocodeResult } from '../types';
import { logger } from '../utils/logger';

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

export class GeocodingService {
  private apiKey: string;
  private countryCode: string;

  constructor() {
    this.apiKey = process.env.GEOCODING_API_KEY || 'demo_key';
    this.countryCode = process.env.GEOCODING_COUNTRY_CODE || 'BR';
  }

  async geocodeAddress(address: string, countryCode?: string): Promise<GeocodeResult> {
    try {
      const country = countryCode || this.countryCode;
      
      // Using OpenStreetMap Nominatim API as a free alternative
      const response = await axios.get<NominatimResponse[]>('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          countrycodes: country.toLowerCase(),
          format: 'json',
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'OZmap-Challenge/1.0',
        },
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('Address not found');
      }

      const result = response.data[0];
      
      logger.info('Geocoding successful', {
        address,
        country,
        result: {
          lat: result.lat,
          lon: result.lon,
          display_name: result.display_name,
        },
      });

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name,
      };
    } catch (error) {
      logger.error('Geocoding failed', {
        address,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 429) {
          throw new Error('Geocoding service rate limit exceeded. Please try again later.');
        }
        throw new Error('Geocoding service unavailable');
      }
      
      throw error;
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
    try {
      const response = await axios.get<NominatimResponse>('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'OZmap-Challenge/1.0',
        },
      });

      if (!response.data) {
        throw new Error('Location not found');
      }

      const result = response.data;
      
      logger.info('Reverse geocoding successful', {
        latitude,
        longitude,
        result: {
          display_name: result.display_name,
        },
      });

      return {
        latitude,
        longitude,
        formattedAddress: result.display_name,
      };
    } catch (error) {
      logger.error('Reverse geocoding failed', {
        latitude,
        longitude,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }
}

