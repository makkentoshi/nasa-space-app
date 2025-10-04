// "use client"

// import { useEffect, useState } from 'react'
// import { fetchUSGSEarthquakes, getStoredAlerts } from '@/lib/alerts'

// export default function AlertDebugger() {
//   const [alerts, setAlerts] = useState<any[]>([])
//   const [loading, setLoading] = useState(false)

//   const refresh = async () => {
//     setLoading(true)
//     await fetchUSGSEarthquakes()
//     const stored = await getStoredAlerts()
//     setAlerts(stored || [])
//     setLoading(false)
//   }

//   useEffect(() => {
//     refresh()
//   }, [])

//   return (
//     <div style={{ padding: 12 }}>
//       <h3>Alerts Debugger</h3>
//       <button onClick={refresh} disabled={loading} style={{ marginBottom: 8 }}>
//         {loading ? 'Loading...' : 'Fetch & Sync USGS'}
//       </button>
//       <div>
//         {alerts.length === 0 && <div>No alerts cached yet.</div>}
//         {alerts.map((a) => (
//           <div key={a.id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
//             <strong>{a.message}</strong>
//             <div>Mag: {a.severity}</div>
//             <div>Location: {a.location.lat}, {a.location.lng}</div>
//             <div style={{ fontSize: 12, color: '#666' }}>{new Date(a.timestamp).toLocaleString()}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }