// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '@/components/toast/ToastProvider'
import { useToast } from '@/components/toast/useToast'

function TestHarness() {
  const toast = useToast()

  return (
    <div>
      <button onClick={() => toast.success('Saved successfully.')}>Show success</button>
      <button onClick={() => toast.error('Could not save.')}>Show error</button>
    </div>
  )
}

afterEach(() => {
  cleanup()
})

describe('ToastProvider', () => {
  it('renders toasts from the hook', async () => {
    const user = userEvent.setup()

    const view = render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>,
    )

    await user.click(view.getByRole('button', { name: 'Show success' }))

    expect(view.getByRole('status').textContent).toContain('Saved successfully.')
  })

  it('auto dismisses toasts after the default duration', async () => {
    vi.useFakeTimers()

    const view = render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>,
    )

    act(() => {
      view.getByRole('button', { name: 'Show error' }).click()
    })

    expect(view.getByRole('alert').textContent).toContain('Could not save.')

    act(() => {
      vi.advanceTimersByTime(3200)
    })

    expect(view.queryByText('Could not save.')).toBeNull()
    vi.useRealTimers()
  })
})
