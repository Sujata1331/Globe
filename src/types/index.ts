export interface Location {
  id: string
  name: string
  lat: number
  lng: number
  playerName?: string
  team?: string
  country?: string
  image?: string
  count?: number // Number of players at this location
}

