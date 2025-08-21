export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Region {
  _id?: string;
  name: string;
  coordinates: GeoJSONPolygon;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRegionRequest {
  name: string;
  coordinates: GeoJSONPolygon;
}

export interface UpdateRegionRequest {
  name?: string;
  coordinates?: GeoJSONPolygon;
}

export interface PointQuery {
  longitude: number;
  latitude: number;
}

export interface DistanceQuery extends PointQuery {
  distance: number; // in meters
}

export interface AddressQuery {
  address: string;
  countryCode?: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

