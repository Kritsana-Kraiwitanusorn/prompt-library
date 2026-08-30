import { useCallback, useState } from 'react'

export function useToast() {
  const [message, setMessage] = useState(null)

  const showToast = useCallback((text, duration = 2200) => {
    setMessage(text)
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => setMessage(null), duration)
  }, [])

  return { message, showToast }
}
