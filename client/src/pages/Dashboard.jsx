import React, { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../state/AuthContext.jsx'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { token, baseId, setBaseId } = useAuth()
  const [equipmentTypeId, setEquipmentTypeId] = useState()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState(null)
  const [netModalOpen, setNetModalOpen] = useState(false)

  async function fetchMetrics() {
    if (!baseId) return
    const qs = new URLSearchParams()
    qs.set('base_id', baseId)
    if (equipmentTypeId) qs.set('equipment_type_id', equipmentTypeId)
    if (startDate) qs.set('start_date', startDate)
    if (endDate) qs.set('end_date', endDate)
    const res = await apiRequest(`/api/dashboard/metrics?${qs.toString()}`, { token })
    setData(res.data?.[0] || null)
  }

  useEffect(() => { fetchMetrics() }, [token, baseId, equipmentTypeId, startDate, endDate])

  return (
    <div>
      <div className="header"><h2>Dashboard</h2><span className="muted">Balances & movements</span></div>
      <RoleShortcuts />
      <div className="toolbar">
        <input className="input" placeholder="Base ID" value={baseId ?? ''} onChange={e => setBaseId(Number(e.target.value)||'')} />
        <input className="input" placeholder="Equipment Type ID" value={equipmentTypeId ?? ''} onChange={e => setEquipmentTypeId(Number(e.target.value)||'')} />
        <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>
      <div className="grid grid-3" style={{ marginTop: 16 }}>
        <Card title="Opening Balance" value={data?.opening_balance ?? 0} />
        <Card title="Closing Balance" value={data?.closing_balance ?? 0} />
        <Card title="Net Movement" value={data?.net_movement ?? 0} onClick={() => setNetModalOpen(true)} clickable />
        <Card title="Purchases" value={data?.purchases ?? 0} />
        <Card title="Transfer In" value={data?.transfer_in ?? 0} />
        <Card title="Transfer Out" value={data?.transfer_out ?? 0} />
        <Card title="Assigned" value={data?.assigned ?? 0} />
        <Card title="Expended" value={data?.expended ?? 0} />
      </div>
      {netModalOpen && (
        <Modal onClose={() => setNetModalOpen(false)}>
          <h3>Net Movement Breakdown</h3>
          <ul>
            <li>Purchases: {data?.purchases ?? 0}</li>
            <li>Transfer In: {data?.transfer_in ?? 0}</li>
            <li>Transfer Out: {data?.transfer_out ?? 0}</li>
          </ul>
        </Modal>
      )}
    </div>
  )
}

function Card({ title, value, onClick, clickable }) {
  return (
    <div onClick={onClick} className={`card ${clickable ? 'clickable' : ''}`}>
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="btn btn-outline close" onClick={onClose}>Close</button>
        <div style={{ clear: 'both', marginBottom: 10 }} />
        {children}
      </div>
    </div>
  )
}

function RoleShortcuts() {
  const { role } = useAuth()
  if (!role) return null
  return (
    <div className="grid" style={{ gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:12, marginBottom:12 }}>
      {(role === 'admin' || role === 'logistics_officer') && (
        <Link className="card clickable" to="/purchases"><div className="card-title">Go to</div><div className="card-value">Purchases</div></Link>
      )}
      {(role === 'admin' || role === 'logistics_officer') && (
        <Link className="card clickable" to="/transfers"><div className="card-title">Go to</div><div className="card-value">Transfers</div></Link>
      )}
      {(role === 'admin' || role === 'base_commander') && (
        <Link className="card clickable" to="/assignments"><div className="card-title">Go to</div><div className="card-value">Assignments & Expenditures</div></Link>
      )}
      {role === 'admin' && (
        <Link className="card clickable" to="/admin"><div className="card-title">Go to</div><div className="card-value">Admin</div></Link>
      )}
    </div>
  )
}


