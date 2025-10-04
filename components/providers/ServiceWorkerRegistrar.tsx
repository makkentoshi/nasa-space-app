"use client"

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    // Avoid registering service worker in development / localhost to prevent caching issues
    try {
      const host = window.location.hostname
      if (host === 'localhost' || host === '127.0.0.1') return
    } catch (e) {
      // ignore
    }

    let mounted = true

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.info('Service Worker registered:', registration.scope)

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (!mounted) return
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available; you might show a notification to user
                console.info('New service worker installed — new content available.')
              } else {
                // Content cached for offline use
                console.info('Service worker installed for first time — content cached.')
              }
            }
          })
        })
      } catch (err) {
        console.error('Service Worker registration failed:', err)
      }
    }

    register()

    return () => {
      mounted = false
    }
  }, [])

  return null
}