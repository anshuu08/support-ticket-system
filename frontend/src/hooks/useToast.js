import { useState, useCallback } from 'react'

let id = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const toastId = ++id
    setToasts(prev => [...prev, { id: toastId, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId))
    }, duration)
  }, [])

  const removeToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId))
  }, [])

  return { toasts, toast: addToast, removeToast }
}
