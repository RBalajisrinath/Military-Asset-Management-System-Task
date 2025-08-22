import React, { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../state/AuthContext.jsx'

export default function Transfers() {
  const { token, baseId } = useAuth()
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ equipment_type_id: '', start_date: '', end_date: '' })
  const [form, setForm] = useState({ from_base_id: '', to_base_id: '', equipment_type_id: '', quantity: '', transferred_at: '' })

  async function load() {
    const qs = new URLSearchParams()
    if (baseId) qs.set('base_id', baseId)
    if (filters.equipment_type_id) qs.set('equipment_type_id', filters.equipment_type_id)
    if (filters.start_date) qs.set('start_date', filters.start_date)
    if (filters.end_date) qs.set('end_date', filters.end_date)
    const res = await apiRequest(`/api/transfers?${qs.toString()}`, { token })
    setRows(res.data || [])
  }

  async function submit(e) {
    e.preventDefault()
    const payload = {
      from_base_id: Number(form.from_base_id),
      to_base_id: Number(form.to_base_id),
      equipment_type_id: Number(form.equipment_type_id),
      quantity: Number(form.quantity),
      transferred_at: form.transferred_at || undefined
    }
    await apiRequest('/api/transfers', { method: 'POST', token, body: payload })
    setForm({ from_base_id: '', to_base_id: '', equipment_type_id: '', quantity: '', transferred_at: '' })
    load()
  }

  useEffect(() => { load() }, [token, baseId, filters.equipment_type_id, filters.start_date, filters.end_date])

  return (
    <div>
      <div className="header"><h2>Transfers</h2><span className="muted">Move assets between bases</span></div>
      <form onSubmit={submit} className="row">
        <input className="input" placeholder="From Base ID" value={form.from_base_id} onChange={e=>setForm(f=>({...f, from_base_id:e.target.value}))} />
        <input className="input" placeholder="To Base ID" value={form.to_base_id} onChange={e=>setForm(f=>({...f, to_base_id:e.target.value}))} />
        <input className="input" placeholder="Equipment Type ID" value={form.equipment_type_id} onChange={e=>setForm(f=>({...f, equipment_type_id:e.target.value}))} />
        <input className="input" placeholder="Quantity" value={form.quantity} onChange={e=>setForm(f=>({...f, quantity:e.target.value}))} />
        <input className="input" type="datetime-local" value={form.transferred_at} onChange={e=>setForm(f=>({...f, transferred_at:e.target.value}))} />
        <button className="btn" type="submit">Record Transfer</button>
      </form>

      <div className="toolbar">
        <input className="input" placeholder="Equipment Type ID" value={filters.equipment_type_id} onChange={e=>setFilters(f=>({...f, equipment_type_id:e.target.value}))} />
        <input className="input" type="date" value={filters.start_date} onChange={e=>setFilters(f=>({...f, start_date:e.target.value}))} />
        <input className="input" type="date" value={filters.end_date} onChange={e=>setFilters(f=>({...f, end_date:e.target.value}))} />
      </div>

      <table className="panel" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>ID</th><th>From</th><th>To</th><th>Equipment</th><th>Qty</th><th>Transferred At</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.from_base_id}</td>
              <td>{r.to_base_id}</td>
              <td>{r.equipment_type_id}</td>
              <td>{r.quantity}</td>
              <td>{new Date(r.transferred_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


