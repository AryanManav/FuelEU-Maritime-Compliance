"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetIntensity = void 0;
exports.energyMJ = energyMJ;
exports.computeCB_gCO2ePerMJ = computeCB_gCO2ePerMJ;
exports.TargetIntensity = 89.3368; // gCO2e/MJ
function energyMJ(fuelTons) {
    // Energy = fuelConsumption × 41000 MJ/t
    return fuelTons * 41000;
}
function computeCB_gCO2ePerMJ(totalEmissions_g, fuelTons) {
    const energy = energyMJ(fuelTons);
    return totalEmissions_g / energy;
}
