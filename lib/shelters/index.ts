export async function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('resq-db', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('shelters')) {
        db.createObjectStore('shelters', { keyPath: 'id' })
      }
    }
  })
}

export async function saveShelters(shelters: any[]) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('shelters', 'readwrite')
    const store = tx.objectStore('shelters')
    for (const s of shelters) {
      try { store.put({ ...s, id: s.name || `${s.location.lat}_${s.location.lng}` }) } catch (e) {}
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getShelters() {
  const db = await openDB()
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction('shelters', 'readonly')
    const store = tx.objectStore('shelters')
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}
