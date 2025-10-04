export interface AlertSource {
  id: string
  name: string
  fetchAlerts(): Promise<NormalizedAlert[]>
}

export interface NormalizedAlert {
  id: string
  externalId?: string
  source: string
  type: AlertType
  severity: AlertSeverity
  headline: string
  description?: string
  geometry: GeoJSON.Geometry
  startsAt?: Date
  endsAt?: Date
  regionCode?: string
  payload?: Record<string, any>
  safetyScore?: number | null
}

export enum AlertType {
  EARTHQUAKE = 'EARTHQUAKE',
  TSUNAMI = 'TSUNAMI',
  WILDFIRE = 'WILDFIRE',
  HURRICANE = 'HURRICANE',
  FLOOD = 'FLOOD',
  TORNADO = 'TORNADO',
  VOLCANO = 'VOLCANO',
  CHEMICAL = 'CHEMICAL',
  OTHER = 'OTHER'
}

export enum AlertSeverity {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
  EXTREME = 'EXTREME'
}
