import React, { useEffect, useState } from 'react'
import apiClient from '../infrastructure/api/apiClient'

export default function PoolingTab() {
  const [pools, setPools] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [adjusted, setAdjusted] = useState<any>({ banked: 0, routes: [] })

  useEffect(() => {
    apiClient.get('/pools').then((r) => setPools(r.data))
    apiClient.get('/routes').then((r) => setRoutes(r.data))
    apiClient.get('/compliance/adjusted-cb?year=2025').then((r) => setAdjusted(r.data))
  }, [])

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }))

  const createPool = async () => {
    const members = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([routeId]) => ({ routeId, amount: 1 })) // demo amount
    const r = await apiClient.post('/pools', { members })
    // refresh pools and adjusted cb
    setPools((p) => [r.data, ...p])
    setAdjusted((await apiClient.get('/compliance/adjusted-cb?year=2025')).data)
  }

  // compute selected pool sum validity (sum of cb_before)
  const selectedRows = adjusted.routes?.filter((row: any) => selected[row.routeId]) || []
  const poolSum = selectedRows.reduce((s: number, r: any) => s + (r.cb_before || 0), 0)
  const poolValid = poolSum >= 0

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Pooling</h2>
      <div className="bg-white shadow rounded p-4 space-y-4">
        <div>
          <h3 className="font-medium">Select ships</h3>
          <div className="grid grid-cols-2 gap-2">
            {routes.map((r) => (
              <label key={r.id} className="flex items-center space-x-2">
                <input type="checkbox" checked={!!selected[r.id]} onChange={() => toggle(r.id)} />
                <span>{r.id} — {r.name}</span>
              </label>
            ))}
          </div>
          <button onClick={createPool} className="mt-3 px-3 py-2 bg-blue-600 text-white rounded">Create Pool</button>
        </div>

        <div>
          <h3 className="font-medium">Adjusted CB (banked: {adjusted.banked})</h3>
          <table className="w-full">
            <thead><tr><th>Route</th><th>CB Before</th><th>CB After</th></tr></thead>
            <tbody>
              {(adjusted.routes || []).map((r: any) => (
                <tr key={r.routeId}>
                  <td>{r.routeId}</td>
                  <td>{r.cb_before?.toFixed(4)}</td>
                  <td>{r.cb_after?.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-medium">Pools</h3>
          <pre className="text-xs">{JSON.stringify(pools, null, 2)}</pre>
        </div>

        <div>
          <h3 className="font-medium">Selected pool summary</h3>
          <p>Sum cb_before: <strong className={poolValid ? 'text-green-600' : 'text-red-600'}>{poolSum.toFixed(4)}</strong></p>
        </div>
      </div>
    </div>
  )
}
