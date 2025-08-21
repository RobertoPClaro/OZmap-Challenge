import { expect } from 'chai';
import sinon from 'sinon';
import axios from 'axios';
import { GeocodingService } from '../../src/services/geocodingService';

type AxiosResponseType<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
};

describe('GeocodingService', () => {
  let geocodingService: GeocodingService;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    geocodingService = new GeocodingService();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('geocodeAddress', () => {
    it('should geocode address successfully', async () => {
      const mockResponse: AxiosResponseType = {
        data: [
          {
            lat: '-23.5505',
            lon: '-46.6333',
            display_name: 'São Paulo, Brasil',
          },
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      sandbox.stub(axios, 'get').resolves(mockResponse);

      const result = await geocodingService.geocodeAddress('São Paulo, Brasil');

      expect(result.latitude).to.equal(-23.5505);
      expect(result.longitude).to.equal(-46.6333);
      expect(result.formattedAddress).to.equal('São Paulo, Brasil');
    });

    it('should throw error when address not found', async () => {
      const mockResponse: AxiosResponseType = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      sandbox.stub(axios, 'get').resolves(mockResponse);

      try {
        await geocodingService.geocodeAddress('Invalid Address');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Address not found');
      }
    });

    it('should handle rate limit error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 429 },
      };

      sandbox.stub(axios, 'get').rejects(axiosError);
      sandbox.stub(axios as any, 'isAxiosError').returns(true);

      try {
        await geocodingService.geocodeAddress('Test Address');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('rate limit exceeded');
      }
    });

    it('should handle service unavailable error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 500 },
      };

      sandbox.stub(axios, 'get').rejects(axiosError);
      sandbox.stub(axios as any, 'isAxiosError').returns(true);

      try {
        await geocodingService.geocodeAddress('Test Address');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal(
          'Geocoding service unavailable'
        );
      }
    });
  });

  describe('reverseGeocode', () => {
    it('should reverse geocode coordinates successfully', async () => {
      const mockResponse: AxiosResponseType = {
        data: { display_name: 'São Paulo, Brasil' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      sandbox.stub(axios, 'get').resolves(mockResponse);

      const result = await geocodingService.reverseGeocode(-23.5505, -46.6333);

      expect(result.latitude).to.equal(-23.5505);
      expect(result.longitude).to.equal(-46.6333);
      expect(result.formattedAddress).to.equal('São Paulo, Brasil');
    });

    it('should throw error when location not found', async () => {
      const mockResponse: AxiosResponseType = {
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      sandbox.stub(axios, 'get').resolves(mockResponse);

      try {
        await geocodingService.reverseGeocode(0, 0);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Location not found');
      }
    });
  });
});
