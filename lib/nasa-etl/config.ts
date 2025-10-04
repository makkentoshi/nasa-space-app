/**
 * NASA ETL Configuration
 * Dataset configurations and ETL pipeline settings
 */

export interface DatasetConfig {
  name: string
  baseUrl: string
  apiKey?: string
  variables: Record<string, VariableConfig>
  spatial: {
    resolution: string
    bounds: {
      north: number
      south: number
      east: number
      west: number
    }
  }
  temporal: {
    resolution: string
    availability: {
      start: string
      end: string
    }
    delay_days: number
  }
  formats: string[]
  authentication: 'api_key' | 'earthdata_login' | 'none'
  rate_limits: {
    requests_per_minute: number
    concurrent_requests: number
  }
}

export interface VariableConfig {
  variable_name: string
  standard_name: string
  units: string
  description: string
  processing_level: string
  quality_flags?: string[]
}

export interface ETLConfig {
  datasets: Record<string, DatasetConfig>
  processing: {
    enable_quality_control: boolean
    outlier_detection: {
      method: 'iqr' | 'zscore' | 'none'
      threshold: number
    }
    gap_filling: {
      method: 'linear' | 'nearest' | 'none'
      max_gap_size: number
    }
    temporal_aggregation: {
      enabled: boolean
      intervals: string[]
    }
  }
  storage: {
    cache_dir: string
    processed_data_path: string
    retention_days: number
  }
  concurrency: {
    max_parallel_jobs: number
    max_concurrent_requests: number
  }
}

// GPM IMERG Configuration
export const GPM_IMERG_CONFIG: DatasetConfig = {
  name: 'GPM IMERG Final Precipitation',
  baseUrl: 'https://gpm.nasa.gov/data/imerg',
  authentication: 'earthdata_login',
  variables: {
    precipitationCal: {
      variable_name: 'precipitationCal',
      standard_name: 'calibrated_precipitation',
      units: 'mm/hr',
      description: 'Calibrated precipitation estimate',
      processing_level: 'L3',
      quality_flags: ['quality', 'probabilityLiquidPrecipitation']
    }
  },
  spatial: {
    resolution: '0.1° x 0.1°',
    bounds: {
      north: 90,
      south: -90,
      east: 180,
      west: -180
    }
  },
  temporal: {
    resolution: '30-minute',
    availability: {
      start: '2000-06-01',
      end: 'present'
    },
    delay_days: 3
  },
  formats: ['HDF5', 'NetCDF'],
  rate_limits: {
    requests_per_minute: 30,
    concurrent_requests: 5
  }
}

// MERRA-2 Configuration
export const MERRA2_CONFIG: DatasetConfig = {
  name: 'MERRA-2 Reanalysis',
  baseUrl: 'https://goldsmr4.gesdisc.eosdis.nasa.gov/data/MERRA2',
  authentication: 'earthdata_login',
  variables: {
    T2M: {
      variable_name: 'T2M',
      standard_name: 'air_temperature',
      units: 'K',
      description: '2-meter air temperature',
      processing_level: 'L3'
    },
    QV2M: {
      variable_name: 'QV2M',
      standard_name: 'specific_humidity',
      units: 'kg/kg',
      description: '2-meter specific humidity',
      processing_level: 'L3'
    },
    U10M: {
      variable_name: 'U10M',
      standard_name: 'eastward_wind',
      units: 'm/s',
      description: '10-meter eastward wind',
      processing_level: 'L3'
    },
    V10M: {
      variable_name: 'V10M',
      standard_name: 'northward_wind',
      units: 'm/s',
      description: '10-meter northward wind',
      processing_level: 'L3'
    }
  },
  spatial: {
    resolution: '0.5° x 0.625°',
    bounds: {
      north: 90,
      south: -90,
      east: 180,
      west: -180
    }
  },
  temporal: {
    resolution: 'hourly',
    availability: {
      start: '1980-01-01',
      end: 'present'
    },
    delay_days: 30
  },
  formats: ['NetCDF-4'],
  rate_limits: {
    requests_per_minute: 20,
    concurrent_requests: 3
  }
}

// NASA POWER Configuration
export const NASA_POWER_CONFIG: DatasetConfig = {
  name: 'NASA POWER',
  baseUrl: 'https://power.larc.nasa.gov/api/temporal',
  authentication: 'none',
  variables: {
    T2M: {
      variable_name: 'T2M',
      standard_name: 'temperature_at_2m',
      units: '°C',
      description: 'Temperature at 2 Meters',
      processing_level: 'L3'
    },
    RH2M: {
      variable_name: 'RH2M',
      standard_name: 'relative_humidity_at_2m',
      units: '%',
      description: 'Relative Humidity at 2 Meters',
      processing_level: 'L3'
    },
    PRECTOTCORR: {
      variable_name: 'PRECTOTCORR',
      standard_name: 'precipitation',
      units: 'mm/day',
      description: 'Precipitation Corrected',
      processing_level: 'L3'
    },
    WS10M: {
      variable_name: 'WS10M',
      standard_name: 'wind_speed_at_10m',
      units: 'm/s',
      description: 'Wind Speed at 10 Meters',
      processing_level: 'L3'
    }
  },
  spatial: {
    resolution: '0.5° x 0.5°',
    bounds: {
      north: 90,
      south: -90,
      east: 180,
      west: -180
    }
  },
  temporal: {
    resolution: 'daily',
    availability: {
      start: '1981-01-01',
      end: 'present'
    },
    delay_days: 1
  },
  formats: ['JSON', 'CSV'],
  rate_limits: {
    requests_per_minute: 60,
    concurrent_requests: 10
  }
}

// EONET Configuration
export const EONET_CONFIG: DatasetConfig = {
  name: 'EONET - Earth Observatory Natural Event Tracker',
  baseUrl: 'https://eonet.gsfc.nasa.gov/api/v3',
  authentication: 'none',
  variables: {
    events: {
      variable_name: 'events',
      standard_name: 'natural_events',
      units: 'categorical',
      description: 'Natural disaster and weather events',
      processing_level: 'L2'
    }
  },
  spatial: {
    resolution: 'point/polygon',
    bounds: {
      north: 90,
      south: -90,
      east: 180,
      west: -180
    }
  },
  temporal: {
    resolution: 'event-based',
    availability: {
      start: '2016-01-01',
      end: 'present'
    },
    delay_days: 1
  },
  formats: ['JSON'],
  rate_limits: {
    requests_per_minute: 100,
    concurrent_requests: 10
  }
}

// Unified dataset registry
export const DATASET_REGISTRY = {
  'gpm_imerg': GPM_IMERG_CONFIG,
  'merra2': MERRA2_CONFIG,
  'nasa_power': NASA_POWER_CONFIG,
  'eonet': EONET_CONFIG
} as const

export type DatasetKey = keyof typeof DATASET_REGISTRY

// Default ETL configuration
export const DEFAULT_ETL_CONFIG: ETLConfig = {
  datasets: DATASET_REGISTRY,
  processing: {
    enable_quality_control: true,
    outlier_detection: {
      method: 'iqr',
      threshold: 1.5
    },
    gap_filling: {
      method: 'linear',
      max_gap_size: 3
    },
    temporal_aggregation: {
      enabled: true,
      intervals: ['hourly', 'daily', 'weekly']
    }
  },
  storage: {
    cache_dir: './data/cache',
    processed_data_path: './data/processed',
    retention_days: 30
  },
  concurrency: {
    max_parallel_jobs: 3,
    max_concurrent_requests: 5
  }
}
