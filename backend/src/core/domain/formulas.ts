export const TargetIntensity = 89.3368 // gCO2e/MJ
export function energyMJ(fuelTons: number) {
  // Energy = fuelConsumption × 41000 MJ/t
  return fuelTons * 41000
}

export function computeCB_gCO2ePerMJ(totalEmissions_g: number, fuelTons: number) {
  const energy = energyMJ(fuelTons)
  return totalEmissions_g / energy
}
