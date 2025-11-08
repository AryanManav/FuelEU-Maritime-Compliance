import { Route } from '../../domain/entities'

export interface RouteRepository {
  list(): Promise<Route[]>
  findById(id: string): Promise<Route | null>
  create(r: Route): Promise<void>
  updateBaseline(id: string, baseline: boolean): Promise<void>
  delete(id: string): Promise<void>
}
