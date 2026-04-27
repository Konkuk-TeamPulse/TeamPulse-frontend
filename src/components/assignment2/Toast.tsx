import { useEffect } from 'react'

export type ToastType = 'info' | 'success' | 'error'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const typeStyles = {
    info: 'bg-gold/90 text-paper border-gold/20',
    success: 'bg-forest/90 text-paper border-forest/20',
    error: 'bg-rust/90 text-paper border-rust/20',
  }

  return (
    <div className="fixed left-1/2 top-10 z-[100] w-[90%] max-w-sm -translate-x-1/2 animate-[rise_0.3s_ease-out]">
      <div className={`flex items-center gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md ${typeStyles[type]}`}>
        <span className="flex-1 text-sm font-bold">{message}</span>
        <button type="button" onClick={onClose} className="scale-125 font-bold leading-none opacity-60">×</button>
      </div>
    </div>
  )
}
