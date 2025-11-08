import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import RoutesTab from './pages/RoutesTab'
import CompareTab from './pages/CompareTab'
import BankingTab from './pages/BankingTab'
import PoolingTab from './pages/PoolingTab'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold">FuelEU Maritime</h1>
          <nav className="space-x-4">
            <Link to="/" className="text-blue-600">Routes</Link>
            <Link to="/compare" className="text-blue-600">Compare</Link>
            <Link to="/banking" className="text-blue-600">Banking</Link>
            <Link to="/pooling" className="text-blue-600">Pooling</Link>
          </nav>
        </div>
      </header>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<RoutesTab />} />
          <Route path="/compare" element={<CompareTab />} />
          <Route path="/banking" element={<BankingTab />} />
          <Route path="/pooling" element={<PoolingTab />} />
        </Routes>
      </main>
    </div>
  )
}
