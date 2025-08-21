import mongoose, { Schema, Document } from 'mongoose';
import { Region as IRegion } from '../types';

export interface RegionDocument extends Omit<IRegion, '_id'>, Document {}

const GeoJSONPolygonSchema = new Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true,
  },
  coordinates: {
    type: [[[Number]]],
    required: true,
  },
});

const RegionSchema = new Schema<RegionDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    coordinates: {
      type: GeoJSONPolygonSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Create geospatial index
RegionSchema.index({ coordinates: '2dsphere' });

// Create text index for name search
RegionSchema.index({ name: 'text' });

// Validate polygon coordinates
RegionSchema.pre('save', function (next) {
  const region = this as RegionDocument;
  
  // Validate that polygon is closed (first and last coordinates are the same)
  const coordinates = region.coordinates.coordinates[0];
  const firstPoint = coordinates[0];
  const lastPoint = coordinates[coordinates.length - 1];
  
  if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
    return next(new Error('Polygon must be closed (first and last coordinates must be the same)'));
  }
  
  // Validate minimum number of coordinates (4 for a triangle + closing point)
  if (coordinates.length < 4) {
    return next(new Error('Polygon must have at least 4 coordinates'));
  }
  
  next();
});

export const Region = mongoose.model<RegionDocument>('Region', RegionSchema);

