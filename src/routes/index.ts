import { Router } from 'express';
import regionRoutes from './regionRoutes';
import { ApiResponse } from '../types';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const response: ApiResponse<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
  }> = {
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
    message: 'API is running successfully',
  };
  
  res.json(response);
});

// API version info
router.get('/version', (req, res) => {
  const response: ApiResponse<{
    version: string;
    name: string;
    description: string;
  }> = {
    success: true,
    data: {
      version: '1.0.0',
      name: 'OZmap Challenge API',
      description: 'RESTful API for managing geographic regions',
    },
    message: 'API version information',
  };
  
  res.json(response);
});

// Mount region routes
router.use('/regions', regionRoutes);

export default router;

