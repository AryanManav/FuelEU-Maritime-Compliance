"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usecases_1 = require("../src/core/application/usecases/usecases");
const formulas_1 = require("../src/core/domain/formulas");
test('computeCB formula', () => {
    const fuel = 10; // t
    const emissions = 1000000; // g
    const cb = (0, usecases_1.computeCB)(emissions, { id: 'T', name: 't', fuelConsumption: fuel, baseline: false });
    expect(cb).toBeCloseTo(emissions / (0, formulas_1.energyMJ)(fuel));
});
