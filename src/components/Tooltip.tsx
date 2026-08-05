import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  label: string
  children: ReactNode
  placement?: 'top' | 'bottom'
}

export function Tooltip({ label, children, placement = 'top' }: Props) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      setPosition({
        left: Math.min(Math.max(rect.left + rect.width / 2, 8), window.innerWidth - 8),
        top: placement === 'top' ? rect.top - 8 : rect.bottom + 8,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, placement])

  return (
    <span
      ref={triggerRef}
      className="inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && createPortal(
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[55] max-w-[min(80vw,240px)] -translate-x-1/2 rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] px-1.5 py-0.5 text-center text-xs text-[var(--gh-text-secondary)] shadow-md"
          style={{ left: position.left, top: position.top, transform: `translate(-50%, ${placement === 'top' ? '-100%' : '0'})` }}
        >
          {label}
        </span>,
        document.body,
      )}
    </span>
  )
}
