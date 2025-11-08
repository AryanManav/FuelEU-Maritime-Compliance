import React, { useEffect, useMemo, useState } from 'react'
import apiClient from '../infrastructure/api/apiClient'

type Route = {
  id: string
  name: string
  fuelConsumption: number
  baseline: boolean
  vesselType?: string
  fuelType?: string
  year?: number
}

export default function RoutesTab() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [filter, setFilter] = useState({ vesselType: 'All', fuelType: 'All', year: 'All' })
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await apiClient.get('/routes')
      setRoutes(r.data || [])
    } catch (err) {
      console.error('Failed to load routes', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const setBaseline = async (id: string) => {
    try {
      await apiClient.post(`/routes/${id}/baseline`)
      await load()
      setMessage(`Baseline set to ${id}`)
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      console.error('Failed to set baseline', err)
      setMessage(`Failed to set baseline: ${err?.message ?? 'error'}`)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const vesselTypes = useMemo(() => Array.from(new Set(routes.map((r) => r.vesselType).filter(Boolean))) as string[], [routes])
  const fuelTypes = useMemo(() => Array.from(new Set(routes.map((r) => r.fuelType).filter(Boolean))) as string[], [routes])
  const years = useMemo(() => Array.from(new Set(routes.map((r) => r.year).filter(Boolean))) as number[], [routes])

  const filtered = routes.filter((rt) => {
    if (filter.vesselType !== 'All' && rt.vesselType !== filter.vesselType) return false
    if (filter.fuelType !== 'All' && rt.fuelType !== filter.fuelType) return false
    if (filter.year !== 'All' && String(rt.year) !== String(filter.year)) return false
    return true
  })

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Routes</h2>

      {message && <div className="mb-2 text-sm text-green-700">{message}</div>}

      <div className="mb-4 flex space-x-2">
        <select value={filter.vesselType} onChange={(e) => setFilter({ ...filter, vesselType: e.target.value })} className="border px-2 py-1">
          <option value="All">All vessel types</option>
          {vesselTypes.map((vt) => <option key={vt} value={vt}>{vt}</option>)}
        </select>
        <select value={filter.fuelType} onChange={(e) => setFilter({ ...filter, fuelType: e.target.value })} className="border px-2 py-1">
          <option value="All">All fuels</option>
          {fuelTypes.map((ft) => <option key={ft} value={ft}>{ft}</option>)}
        </select>
        <select value={filter.year} onChange={(e) => setFilter({ ...filter, year: e.target.value })} className="border px-2 py-1">
          <option value="All">All years</option>
          {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
        </select>
        <button onClick={load} className="px-3 py-1 bg-gray-200 rounded">Reload</button>
      </div>

      <div className="bg-white shadow rounded p-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-left">ID</th>
                <th className="text-left">Name</th>
                <th className="text-left">Vessel</th>
                <th className="text-left">Fuel</th>
                <th className="text-left">Year</th>
                <th className="text-left">Fuel t</th>
                <th className="text-left">Baseline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rt) => (
                <tr key={rt.id} className="border-t">
                  <td className="py-2">{rt.id}</td>
                  <td>{rt.name}</td>
                  <td>{rt.vesselType ?? '—'}</td>
                  <td>{rt.fuelType ?? '—'}</td>
                  <td>{rt.year ?? '—'}</td>
                  <td>{rt.fuelConsumption}</td>
                  <td>{rt.baseline ? 'Yes' : 'No'}</td>
                  <td>
                    <button onClick={() => setBaseline(rt.id)} className="text-sm text-blue-600">Set Baseline</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-4 text-center text-gray-500">No routes</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
