import express from 'express';
import cors from 'cors';
import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Initialize BigQuery with credentials
const bigquery = new BigQuery({
  keyFilename: path.join(__dirname, '..', 'ocean-data-e68c2-b53062a9fb64.json'),
  projectId: 'ocean-data-e68c2'
});

app.get('/api/ocean-currents', async (req, res) => {
  try {
    console.log('Fetching ocean current data...');
    const query = 'SELECT depth, latitude, longitude, time, uo, vo FROM `ocean-data-e68c2.ocean_data.current_data`';
    const options = {
      query: query,
      location: 'US'
    };

    const [rows] = await bigquery.query(options);
    console.log(`Fetched ${rows.length} ocean current data points`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching ocean current data:', error);
    res.status(500).json({ error: 'Failed to fetch ocean current data' });
  }
});

app.get('/api/ocean-oxygen', async (req, res) => {
  try {
    console.log('Fetching ocean oxygen data...');
    const query = 'SELECT depth, latitude, longitude, time, o2, nppv FROM `ocean-data-e68c2.ocean_data.biogeochemical_data`';
    const options = {
      query: query,
      location: 'US'
    };

    const [rows] = await bigquery.query(options);
    console.log(`Fetched ${rows.length} ocean oxygen data points`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching ocean oxygen data:', error);
    res.status(500).json({ error: 'Failed to fetch ocean oxygen data' });
  }
});

app.get('/api/ocean-temperature', async (req, res) => {
  try {
    console.log('Fetching ocean temperature data...');
    const query = 'SELECT depth, latitude, longitude, time, thetao FROM `ocean-data-e68c2.ocean_data.current_data_2`';
    const options = {
      query: query,
      location: 'US'
    };

    const [rows] = await bigquery.query(options);
    console.log(`Fetched ${rows.length} ocean temperature data points`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching ocean temperature data:', error);
    res.status(500).json({ error: 'Failed to fetch ocean temperature data' });
  }
});

app.get('/api/pfz', async (req, res) => {
  try {
    console.log('Fetching PFZ data...');
    const query = 'SELECT * FROM `ocean-data-e68c2.ocean_data.pfz`';
    const options = {
      query: query,
      location: 'US'
    };

    const [rows] = await bigquery.query(options);
    
    // Process WKT strings to extract coordinates
    const processedRows = rows.map(row => {
      const wktMatch = row.WKT.match(/LINESTRING \((.*?)\)/);
      if (wktMatch && wktMatch[1]) {
        const [start, end] = wktMatch[1].split(',').map(point => {
          const [longitude, latitude] = point.trim().split(' ').map(Number);
          return { longitude, latitude };
        });
        
        return {
          wkt: row.WKT,
          name: row.name,
          description: row.description,
          coordinates: { start, end }
        };
      }
      return null;
    }).filter(Boolean);

    console.log(`Fetched and processed ${processedRows.length} PFZ data points`);
    res.json(processedRows);
  } catch (error) {
    console.error('Error fetching PFZ data:', error);
    res.status(500).json({ error: 'Failed to fetch PFZ data' });
  }
});

app.get('/api/wind-data', async (req, res) => {
  try {
    console.log('Fetching wind data...');
    const query = `
      SELECT 
        time,
        latitude,
        longitude,
        eastward_wind,
        northward_wind
      FROM \`ocean-data-e68c2.ocean_data.wind_data\`
      WHERE 
        latitude BETWEEN 5.554121417215164 AND 17.074981057486614
        AND longitude BETWEEN 71.67651854792956 AND 83.99011977588334
    `;
    
    const options = {
      query: query,
      location: 'US'
    };

    console.log('Executing BigQuery:', query);
    const [rows] = await bigquery.query(options);
    console.log(`Fetched ${rows.length} wind data points`);
    
    if (rows.length === 0) {
      console.warn('No wind data found in the specified region');
    } else {
      console.log('Sample wind data point:', rows[0]);
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching wind data:', error);
    if (error.code === 404) {
      res.status(404).json({ error: 'Wind data table not found' });
    } else if (error.code === 'ENOTFOUND') {
      res.status(500).json({ error: 'Could not connect to BigQuery' });
    } else {
      res.status(500).json({ error: 'Failed to fetch wind data', details: error.message });
    }
  }
});

app.get('/api/alert-image', async (req, res) => {
  try {
    console.log('Fetching alert image URL...');
    const query = 'SELECT * FROM `ocean-data-e68c2.ocean_data.link`';
    const options = {
      query: query,
      location: 'US'
    };

    const [rows] = await bigquery.query(options);
    
    if (rows && rows.length > 0 && rows[0].url) {
      console.log('Fetched alert image URL successfully');
      res.json({ url: rows[0].url, name: rows[0].name });
    } else {
      console.error('No alert image URL found');
      res.status(404).json({ error: 'No alert image URL found' });
    }
  } catch (error) {
    console.error('Error fetching alert image URL:', error);
    res.status(500).json({ error: 'Failed to fetch alert image URL' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});