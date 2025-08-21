import { expect } from 'chai';
import sinon from 'sinon';
import { RegionService } from '../../src/services/regionService';
import { Region } from '../../src/models/Region';
import { CreateRegionRequest, UpdateRegionRequest, PointQuery, DistanceQuery } from '../../src/types';

describe('RegionService', () => {
  let regionService: RegionService;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    regionService = new RegionService();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createRegion', () => {
    it('should create a region successfully', async () => {
      const regionData: CreateRegionRequest = {
        name: 'Test Region',
        coordinates: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
      };

      const mockRegion = {
        _id: 'mockId',
        ...regionData,
        save: sandbox.stub().resolves({
          _id: 'mockId',
          ...regionData,
        }),
      };

      sandbox.stub(Region.prototype, 'save').resolves(mockRegion);

      const result = await regionService.createRegion(regionData);

      expect(result).to.deep.include(regionData);
    });

    it('should throw error when region data is invalid', async () => {
      const invalidRegionData = {
        name: '',
        coordinates: {
          type: 'Polygon',
          coordinates: [[[0, 0]]],
        },
      } as CreateRegionRequest;

      sandbox.stub(Region.prototype, 'save').rejects(new Error('Validation failed'));

      try {
        await regionService.createRegion(invalidRegionData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Validation failed');
      }
    });
  });

  describe('getAllRegions', () => {
    it('should return paginated regions', async () => {
      const mockRegions = [
        { _id: '1', name: 'Region 1' },
        { _id: '2', name: 'Region 2' },
      ];

      sandbox.stub(Region, 'find').returns({
        skip: sandbox.stub().returnsThis(),
        limit: sandbox.stub().returnsThis(),
        sort: sandbox.stub().resolves(mockRegions),
      } as any);

      sandbox.stub(Region, 'countDocuments').resolves(2);

      const result = await regionService.getAllRegions({ page: 1, limit: 10 });

      expect(result.data).to.have.length(2);
      expect(result.pagination.page).to.equal(1);
      expect(result.pagination.limit).to.equal(10);
      expect(result.pagination.total).to.equal(2);
    });
  });

  describe('getRegionById', () => {
    it('should return region when found', async () => {
      const mockRegion = { _id: 'testId', name: 'Test Region' };
      sandbox.stub(Region, 'findById').resolves(mockRegion);

      const result = await regionService.getRegionById('testId');

      expect(result).to.deep.equal(mockRegion);
    });

    it('should return null when region not found', async () => {
      sandbox.stub(Region, 'findById').resolves(null);

      const result = await regionService.getRegionById('nonexistentId');

      expect(result).to.be.null;
    });
  });

  describe('updateRegion', () => {
    it('should update region successfully', async () => {
      const updateData: UpdateRegionRequest = { name: 'Updated Region' };
      const mockUpdatedRegion = { _id: 'testId', name: 'Updated Region' };

      sandbox.stub(Region, 'findByIdAndUpdate').resolves(mockUpdatedRegion);

      const result = await regionService.updateRegion('testId', updateData);

      expect(result).to.deep.equal(mockUpdatedRegion);
    });
  });

  describe('deleteRegion', () => {
    it('should delete region successfully', async () => {
      const mockRegion = { _id: 'testId', name: 'Test Region' };
      sandbox.stub(Region, 'findByIdAndDelete').resolves(mockRegion);

      const result = await regionService.deleteRegion('testId');

      expect(result).to.be.true;
    });

    it('should return false when region not found', async () => {
      sandbox.stub(Region, 'findByIdAndDelete').resolves(null);

      const result = await regionService.deleteRegion('nonexistentId');

      expect(result).to.be.false;
    });
  });

  describe('getRegionsContainingPoint', () => {
    it('should return regions containing the point', async () => {
      const point: PointQuery = { longitude: 0.5, latitude: 0.5 };
      const mockRegions = [{ _id: '1', name: 'Region 1' }];

      sandbox.stub(Region, 'find').resolves(mockRegions);

      const result = await regionService.getRegionsContainingPoint(point);

      expect(result).to.deep.equal(mockRegions);
    });
  });

  describe('getRegionsWithinDistance', () => {
    it('should return regions within distance', async () => {
      const query: DistanceQuery = { longitude: 0, latitude: 0, distance: 1000 };
      const mockRegions = [{ _id: '1', name: 'Region 1' }];

      sandbox.stub(Region, 'find').resolves(mockRegions);

      const result = await regionService.getRegionsWithinDistance(query);

      expect(result).to.deep.equal(mockRegions);
    });
  });

  describe('searchRegionsByName', () => {
    it('should return regions matching name search', async () => {
      const mockRegions = [{ _id: '1', name: 'Test Region' }];

      sandbox.stub(Region, 'find').returns({
        skip: sandbox.stub().returnsThis(),
        limit: sandbox.stub().returnsThis(),
        sort: sandbox.stub().resolves(mockRegions),
      } as any);

      sandbox.stub(Region, 'countDocuments').resolves(1);

      const result = await regionService.searchRegionsByName('Test');

      expect(result.data).to.have.length(1);
      expect(result.data[0].name).to.equal('Test Region');
    });
  });
});

