import { computeCB } from '../src/core/application/usecases/usecases'
import { energyMJ } from '../src/core/domain/formulas'

test('computeCB formula', () => {
  const fuel = 10 // t
  const emissions = 1000000 // g
  const cb = computeCB(emissions, { id: 'T', name: 't', fuelConsumption: fuel, baseline: false })
  expect(cb).toBeCloseTo(emissions / energyMJ(fuel))
})
