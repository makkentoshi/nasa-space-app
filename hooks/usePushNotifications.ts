import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'

export function usePushNotifications() {
  const { user } = useUser()
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  const subscribe = async () => {
    if (!isSupported || !user || permission !== 'granted') return false

    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        console.error('VAPID public key is not configured')
        return false
      }
      
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })

      // Send subscription to server
      const response = await fetch('/api/push/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: user.id
        })
      })

      if (response.ok) {
        setIsSubscribed(true)
        return true
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
    }

    return false
  }

  const unsubscribe = async () => {
    if (!isSupported) return false

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        setIsSubscribed(false)
        return true
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
    }

    return false
  }

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return false

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
      return !!subscription
    } catch (error) {
      console.error('Error checking push subscription:', error)
    }

    return false
  }, [isSupported])

  useEffect(() => {
    if (isSupported && user) {
      checkSubscription()
    }
  }, [isSupported, user, checkSubscription])

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    checkSubscription
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string | undefined) {
  if (!base64String) {
    console.warn('VAPID key is not configured. Push notifications will not work.')
    // Return empty array as fallback
    return new Uint8Array(0)
  }
  
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}