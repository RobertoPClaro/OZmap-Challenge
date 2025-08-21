// MongoDB initialization script
db = db.getSiblingDB('ozmap-challenge');

// Create collections
db.createCollection('regions');

// Create indexes for geospatial queries
db.regions.createIndex({ "coordinates": "2dsphere" });
db.regions.createIndex({ "name": 1 });

print('Database initialized successfully');

