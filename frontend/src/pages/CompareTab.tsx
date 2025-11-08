import React, { useEffect, useState } from 'react'
import apiClient from '../infrastructure/api/apiClient'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const TARGET = 89.3368

export default function CompareTab() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    apiClient.get('/routes/comparison').then((r) => setData(r.data || []))
  }, [])

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Compare Baseline vs Routes</h2>
      <div className="bg-white shadow rounded p-4 space-y-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="routeId" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cb" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <table className="w-full">
            <thead>
              <tr>
                <th>Route</th>
                <th>CB (gCO2e/MJ)</th>
                <th>Delta</th>
                <th>Compliant?</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d: any) => {
                const compliant = d.cb <= TARGET
                return (
                  <tr key={d.routeId}>
                    <td>{d.routeId}</td>
                    <td>{d.cb.toFixed(4)}</td>
                    <td>{(d.delta || 0).toFixed(4)}</td>
                    <td>{compliant ? '✅' : '❌'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
