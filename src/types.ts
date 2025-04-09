export interface OceanCurrentData {
  depth: number;
  time: string;
  latitude: number;
  longitude: number;
  uo: number;
  vo: number;
}

export interface BiogeochemicalData {
  depth: number;
  time: string;
  latitude: number;
  longitude: number;
  o2: number;
  nppv: number;
}

export interface TemperatureData {
  depth: number;
  time: string;
  latitude: number;
  longitude: number;
  thetao: number;
}

export interface PFZData {
  wkt: string;
  name?: string;
  description?: string;
  coordinates: {
    start: { longitude: number; latitude: number };
    end: { longitude: number; latitude: number };
  };
}

export interface WindData {
  time: string;
  latitude: number;
  longitude: number;
  eastward_wind: number;
  northward_wind: number;
}

export interface ProcessedData {
  [date: string]: {
    currents: OceanCurrentData[];
    oxygen?: BiogeochemicalData[];
    temperature?: TemperatureData[];
    pfz?: PFZData[];
    wind?: WindData[];
  };
}

export type LayerType = 'currents' | 'oxygen' | 'temperature' | 'pfz' | 'wind';