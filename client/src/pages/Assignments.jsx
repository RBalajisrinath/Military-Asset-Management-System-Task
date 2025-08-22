import React, { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../state/AuthContext.jsx'

export default function Assignments() {
  const { token, baseId, role } = useAuth()
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ equipment_type_id: '', start_date: '', end_date: '' })
  const [assignForm, setAssignForm] = useState({ equipment_type_id: '', quantity: '', assigned_to: '', assigned_at: '' })
  const [expForm, setExpForm] = useState({ equipment_type_id: '', quantity: '', expended_at: '', notes: '' })
  const [assignBaseId, setAssignBaseId] = useState('')
  const [expBaseId, setExpBaseId] = useState('')
  const [filterBaseId, setFilterBaseId] = useState('')
  const [assignError, setAssignError] = useState('')
  const [expError, setExpError] = useState('')

  async function load() {
    const effectiveBaseId = role === 'admin'
      ? Number(filterBaseId || assignBaseId || expBaseId)
      : baseId
    if (!effectiveBaseId) return
    const qs = new URLSearchParams()
    qs.set('base_id', effectiveBaseId)
    if (filters.equipment_type_id) qs.set('equipment_type_id', filters.equipment_type_id)
    if (filters.start_date) qs.set('start_date', filters.start_date)
    if (filters.end_date) qs.set('end_date', filters.end_date)
    const res = await apiRequest(`/api/assignments?${qs.toString()}`, { token })
    setRows(res.data || [])
  }

  async function submitAssign(e) {
    e.preventDefault()
    setAssignError('')
    const chosenBaseId = role === 'admin' ? Number(assignBaseId) : baseId
    const equipmentTypeIdNum = Number(assignForm.equipment_type_id)
    const quantityNum = Number(assignForm.quantity)
    if (!chosenBaseId || !equipmentTypeIdNum || !quantityNum || !assignForm.assigned_to) {
      setAssignError('Please provide Base ID (if admin), Equipment Type ID, Quantity, and Assigned To')
      return
    }
    const payload = {
      base_id: chosenBaseId,
      equipment_type_id: equipmentTypeIdNum,
      quantity: quantityNum,
      assigned_to: assignForm.assigned_to,
      assigned_at: assignForm.assigned_at || undefined
    }
    try {
      await apiRequest('/api/assignments', { method: 'POST', token, body: payload })
      setAssignForm({ equipment_type_id: '', quantity: '', assigned_to: '', assigned_at: '' })
      if (role === 'admin' && !filterBaseId) setFilterBaseId(String(chosenBaseId))
      load()
    } catch (err) {
      setAssignError(err.message)
    }
  }

  async function submitExp(e) {
    e.preventDefault()
    setExpError('')
    const chosenBaseId = role === 'admin' ? Number(expBaseId) : baseId
    const equipmentTypeIdNum = Number(expForm.equipment_type_id)
    const quantityNum = Number(expForm.quantity)
    if (!chosenBaseId || !equipmentTypeIdNum || !quantityNum) {
      setExpError('Please provide Base ID (if admin), Equipment Type ID, and Quantity')
      return
    }
    const payload = {
      base_id: chosenBaseId,
      equipment_type_id: equipmentTypeIdNum,
      quantity: quantityNum,
      notes: expForm.notes || undefined,
      expended_at: expForm.expended_at || undefined
    }
    try {
      await apiRequest('/api/expenditures', { method: 'POST', token, body: payload })
      setExpForm({ equipment_type_id: '', quantity: '', expended_at: '', notes: '' })
      if (role === 'admin' && !filterBaseId) setFilterBaseId(String(chosenBaseId))
      load()
    } catch (err) {
      setExpError(err.message)
    }
  }

  useEffect(() => { load() }, [token, baseId, filters.equipment_type_id, filters.start_date, filters.end_date])

  return (
    <div>
      <div className="header"><h2>Assignments & Expenditures</h2><span className="muted">Track issued and used assets</span></div>
      <div className="grid" style={{ gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <form className="card" onSubmit={submitAssign}>
          <h3>Assign</h3>
          <div className="row">
            {role === 'admin' && (
              <input className="input" placeholder="Base ID" value={assignBaseId} onChange={e=>setAssignBaseId(e.target.value)} />
            )}
            <input className="input" placeholder="Equipment Type ID" value={assignForm.equipment_type_id} onChange={e=>setAssignForm(f=>({...f, equipment_type_id:e.target.value}))} />
            <input className="input" placeholder="Quantity" value={assignForm.quantity} onChange={e=>setAssignForm(f=>({...f, quantity:e.target.value}))} />
            <input className="input" placeholder="Assigned To" value={assignForm.assigned_to} onChange={e=>setAssignForm(f=>({...f, assigned_to:e.target.value}))} />
            <input className="input" type="datetime-local" value={assignForm.assigned_at} onChange={e=>setAssignForm(f=>({...f, assigned_at:e.target.value}))} />
            <button className="btn" type="submit">Record Assignment</button>
          </div>
          {assignError && <div style={{color:'crimson', marginTop:8}}>{assignError}</div>}
        </form>
        <form className="card" onSubmit={submitExp}>
          <h3>Expend</h3>
          <div className="row">
            {role === 'admin' && (
              <input className="input" placeholder="Base ID" value={expBaseId} onChange={e=>setExpBaseId(e.target.value)} />
            )}
            <input className="input" placeholder="Equipment Type ID" value={expForm.equipment_type_id} onChange={e=>setExpForm(f=>({...f, equipment_type_id:e.target.value}))} />
            <input className="input" placeholder="Quantity" value={expForm.quantity} onChange={e=>setExpForm(f=>({...f, quantity:e.target.value}))} />
            <input className="input" type="datetime-local" value={expForm.expended_at} onChange={e=>setExpForm(f=>({...f, expended_at:e.target.value}))} />
            <input className="input" placeholder="Notes" value={expForm.notes} onChange={e=>setExpForm(f=>({...f, notes:e.target.value}))} />
            <button className="btn" type="submit">Record Expenditure</button>
          </div>
          {expError && <div style={{color:'crimson', marginTop:8}}>{expError}</div>}
        </form>
      </div>

      <div className="toolbar">
        {role === 'admin' && (
          <input className="input" placeholder="Base ID (filter)" value={filterBaseId} onChange={e=>setFilterBaseId(e.target.value)} />
        )}
        <input className="input" placeholder="Equipment Type ID" value={filters.equipment_type_id} onChange={e=>setFilters(f=>({...f, equipment_type_id:e.target.value}))} />
        <input className="input" type="date" value={filters.start_date} onChange={e=>setFilters(f=>({...f, start_date:e.target.value}))} />
        <input className="input" type="date" value={filters.end_date} onChange={e=>setFilters(f=>({...f, end_date:e.target.value}))} />
      </div>

      <table className="panel" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>ID</th><th>Base</th><th>Equipment</th><th>Qty</th><th>Assigned To</th><th>Assigned At</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.base_id}</td>
              <td>{r.equipment_type_id}</td>
              <td>{r.quantity}</td>
              <td>{r.assigned_to}</td>
              <td>{new Date(r.assigned_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


