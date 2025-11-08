import React, { useEffect, useState } from 'react'
import apiClient from '../infrastructure/api/apiClient'

export default function BankingTab() {
  const [banked, setBanked] = useState<number | null>(null)
  const [cbSummary, setCbSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiClient.get('/banking/bank').then((r) => setBanked(r.data.banked || 0))
    apiClient.get('/compliance/cb').then((r) => setCbSummary(r.data))
  }, [])

  const apply = async () => {
    setLoading(true)
    await apiClient.post('/banking/apply')
    const r = await apiClient.get('/banking/bank')
    setBanked(r.data.banked)
    setCbSummary((await apiClient.get('/compliance/cb')).data)
    setLoading(false)
  }

  const bank = async () => {
    setLoading(true)
    await apiClient.post('/banking/bank')
    const r = await apiClient.get('/banking/bank')
    setBanked(r.data.banked)
    setCbSummary((await apiClient.get('/compliance/cb')).data)
    setLoading(false)
  }

  const surplus_g = cbSummary?.surplus_g || 0
  const disabled = surplus_g <= 0 || loading

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Banking</h2>
      <div className="bg-white shadow rounded p-4 space-y-3">
        <p>Banked surplus: <strong>{banked ?? '—'}</strong> gCO₂e</p>
        <p>Computed surplus (this run): <strong>{surplus_g}</strong> gCO₂e</p>
        <div className="space-x-2">
          <button onClick={bank} disabled={disabled} className={`mt-2 px-3 py-2 rounded ${disabled ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}>Bank Surplus</button>
          <button onClick={apply} disabled={(banked || 0) <= 0 || loading} className={`mt-2 px-3 py-2 rounded ${((banked || 0) <= 0) ? 'bg-gray-300' : 'bg-green-600 text-white'}`}>Apply Bank</button>
        </div>

        <div>
          <h3 className="font-medium">KPIs</h3>
          <pre className="text-xs">{JSON.stringify(cbSummary, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
