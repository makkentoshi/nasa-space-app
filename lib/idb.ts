// Minimal idb helper for storing JSON objects in IndexedDB.
// Uses native IndexedDB APIs to avoid extra dependencies.

const DB_NAME = 'resq-db'
const DB_VERSION = 1

export function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('alerts')) {
        db.createObjectStore('alerts', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('shelters')) {
        db.createObjectStore('shelters', { keyPath: 'id' })
      }
    }
  })
}

export async function putAlert(alert: any) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('alerts', 'readwrite')
    const store = tx.objectStore('alerts')
    const req = store.put(alert)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getAlerts() {
  const db = await openDB()
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction('alerts', 'readonly')
    const store = tx.objectStore('alerts')
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

export async function clearAlerts() {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('alerts', 'readwrite')
    const store = tx.objectStore('alerts')
    const req = store.clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}
