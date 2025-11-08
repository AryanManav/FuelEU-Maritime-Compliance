export type Route = {
  id: string
  name: string
  fuelConsumption: number // tonnes
  baseline: boolean
  // optional metadata used by frontend filters & pooling
  vesselType?: string
  fuelType?: string
  year?: number
}

export type CBRecord = {
  routeId: string
  cb: number // gCO2e/MJ
}

export type PoolMember = {
  routeId: string
  amount: number
}
