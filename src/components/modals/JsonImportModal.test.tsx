// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { JsonImportModal } from '@/components/modals/JsonImportModal'
import { ToastProvider } from '@/components/toast/ToastProvider'

afterEach(() => {
  cleanup()
})

describe('JsonImportModal', () => {
  it('shows a toast when validation fails', async () => {
    const user = userEvent.setup()

    const view = render(
      <ToastProvider>
        <JsonImportModal open onClose={vi.fn()} onImport={vi.fn()} />
      </ToastProvider>,
    )

    await user.click(view.getByRole('textbox'))
    await user.paste('{bad json')
    await user.click(view.getByRole('button', { name: 'Validate' }))

    expect(view.getByRole('alert').textContent).toContain('Invalid JSON format.')
  })

  it('shows a success toast and imports valid json', async () => {
    const user = userEvent.setup()
    const onImport = vi.fn()
    const onClose = vi.fn()

    const view = render(
      <ToastProvider>
        <JsonImportModal open onClose={onClose} onImport={onImport} />
      </ToastProvider>,
    )

    await user.click(view.getByRole('textbox'))
    await user.paste('{"name":"Doggie"}')
    await user.click(view.getByRole('button', { name: 'Import' }))

    expect(onImport).toHaveBeenCalledWith('{"name":"Doggie"}')
    expect(onClose).toHaveBeenCalledOnce()
    expect(view.getByRole('status').textContent).toContain('JSON imported into the request body.')
  })
})
