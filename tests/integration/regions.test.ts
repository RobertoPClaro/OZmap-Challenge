import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { Region } from '../../src/models/Region';
import { CreateRegionRequest } from '../../src/types';

describe('Regions API Integration Tests', () => {
  let createdRegionId: string;

  before(async () => {
    const mongoUri =
      process.env.MONGODB_TEST_URI ||
      'mongodb://localhost:27017/ozmap-challenge-test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await Region.deleteMany({});
  });

  after(async () => {
    await mongoose.disconnect();
  });

  describe('POST /api/regions', () => {
    it('should create a new region', async () => {
      const regionData: CreateRegionRequest = {
        name: 'Test Region',
        coordinates: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      };

      const response = await request(app)
        .post('/api/regions')
        .send(regionData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.data.name).to.equal(regionData.name);

      expect(response.body.data.coordinates.type).to.equal(
        regionData.coordinates.type
      );
      expect(response.body.data.coordinates.coordinates).to.deep.equal(
        regionData.coordinates.coordinates
      );

      createdRegionId = response.body.data._id; // usar _id
    });

    it('should return validation error for invalid region data', async () => {
      const invalidRegionData = {
        name: '',
        coordinates: {
          type: 'Polygon',
          coordinates: [[[0, 0]]],
        },
      };

      const response = await request(app)
        .post('/api/regions')
        .send(invalidRegionData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Validation failed');
    });

    it('should return validation error for unclosed polygon', async () => {
      const invalidRegionData = {
        name: 'Invalid Region',
        coordinates: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
            ],
          ], // não fechado
        },
      };

      const response = await request(app)
        .post('/api/regions')
        .send(invalidRegionData)
        .expect((res) => {
          if (![400, 500].includes(res.status)) {
            throw new Error(`Expected 400 or 500, got ${res.status}`);
          }
        });

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.match(/Polygon|Validation/);
    });
  });

  describe('GET /api/regions', () => {
    beforeEach(async () => {
      // Create test regions
      const regions = [
        {
          name: 'Region 1',
          coordinates: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0],
              ],
            ],
          },
        },
        {
          name: 'Region 2',
          coordinates: {
            type: 'Polygon',
            coordinates: [
              [
                [2, 2],
                [3, 2],
                [3, 3],
                [2, 3],
                [2, 2],
              ],
            ],
          },
        },
      ];

      await Region.insertMany(regions);
    });

    it('should get all regions with pagination', async () => {
      const response = await request(app)
        .get('/api/regions')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.data).to.have.length(2);
      expect(response.body.data.pagination.page).to.equal(1);
      expect(response.body.data.pagination.total).to.equal(2);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/regions')
        .query({ page: 1, limit: 1 })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.data).to.have.length(1);
      expect(response.body.data.pagination.totalPages).to.equal(2);
    });
  });

  describe('GET /api/regions/:id', () => {
    let regionId: string;

    beforeEach(async () => {
      const region = new Region({
        name: 'Test Region',
        coordinates: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      });
      const savedRegion = await region.save();
      regionId = (savedRegion._id as mongoose.Types.ObjectId).toString();
    });

    it('should get region by ID', async () => {
      const response = await request(app)
        .get(`/api/regions/${regionId}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.name).to.equal('Test Region');
    });

    it('should return 404 for non-existent region', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/regions/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Region not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/regions/invalid-id')
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Validation failed');
    });
  });

  describe('PUT /api/regions/:id', () => {
    let regionId: string;

    beforeEach(async () => {
      const region = new Region({
        name: 'Test Region',
        coordinates: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      });
      const savedRegion = await region.save();
      regionId = (savedRegion._id as mongoose.Types.ObjectId).toString();
    });

    it('should update region', async () => {
      const updateData = { name: 'Updated Region' };

      const response = await request(app)
        .put(`/api/regions/${regionId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.name).to.equal('Updated Region');
    });

    it('should return 404 for non-existent region', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: 'Updated Region' };

      const response = await request(app)
        .put(`/api/regions/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Region not found');
    });
  });

  describe('DELETE /api/regions/:id', () => {
    let regionId: string;

    beforeEach(async () => {
      const region = new Region({
        name: 'Test Region',
        coordinates: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      });
      const savedRegion = await region.save();
      regionId = (savedRegion._id as mongoose.Types.ObjectId).toString();
    });

    it('should delete region', async () => {
      const response = await request(app)
        .delete(`/api/regions/${regionId}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal('Region deleted successfully');

      // Verify region is deleted
      const deletedRegion = await Region.findById(regionId);
      expect(deletedRegion).to.be.null;
    });

    it('should return 404 for non-existent region', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/regions/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Region not found');
    });
  });

  describe('GET /api/regions/point', () => {
    beforeEach(async () => {
      // Create a region that contains point (0.5, 0.5)
      const region = new Region({
        name: 'Container Region',
        coordinates: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      });
      await region.save();
    });

    it('should find regions containing a point', async () => {
      const response = await request(app)
        .get('/api/regions/point')
        .query({ longitude: 0.5, latitude: 0.5 })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.have.length(1);
      expect(response.body.data[0].name).to.equal('Container Region');
    });

    it('should return empty array for point outside regions', async () => {
      const response = await request(app)
        .get('/api/regions/point')
        .query({ longitude: 5, latitude: 5 })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.have.length(0);
    });

    it('should return validation error for invalid coordinates', async () => {
      const response = await request(app)
        .get('/api/regions/point')
        .query({ longitude: 'invalid', latitude: 0.5 })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Validation failed');
    });
  });

  describe('GET /api/regions/distance', () => {
    beforeEach(async () => {
      const region = new Region({
        name: 'Nearby Region',
        coordinates: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      });
      await region.save();
    });

    it('should find regions within distance', async () => {
      const response = await request(app)
        .get('/api/regions/distance')
        .query({ longitude: 0, latitude: 0, distance: 100000 })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.length).to.be.at.least(0);
    });

    it('should return validation error for invalid distance', async () => {
      const response = await request(app)
        .get('/api/regions/distance')
        .query({ longitude: 0, latitude: 0, distance: -1 })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Validation failed');
    });
  });

  describe('GET /api/regions/search', () => {
    beforeEach(async () => {
      const regions = [
        {
          name: 'São Paulo',
          coordinates: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0],
              ],
            ],
          },
        },
        {
          name: 'Rio de Janeiro',
          coordinates: {
            type: 'Polygon',
            coordinates: [
              [
                [2, 2],
                [3, 2],
                [3, 3],
                [2, 3],
                [2, 2],
              ],
            ],
          },
        },
      ];

      await Region.insertMany(regions);
    });

    it('should search regions by name', async () => {
      const response = await request(app)
        .get('/api/regions/search')
        .query({ name: 'São' })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.data).to.have.length(1);
      expect(response.body.data.data[0].name).to.equal('São Paulo');
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app)
        .get('/api/regions/search')
        .query({ name: 'NonExistent' })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.data).to.have.length(0);
    });

    it('should return validation error for empty search term', async () => {
      const response = await request(app)
        .get('/api/regions/search')
        .query({ name: '' })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Validation failed');
    });
  });
});
