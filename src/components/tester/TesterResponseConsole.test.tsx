// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TesterResponseConsole } from '@/components/tester/TesterResponseConsole'
import { ToastProvider } from '@/components/toast/ToastProvider'

afterEach(() => {
  cleanup()
})

const response = {
  statusCode: 200,
  statusText: 'OK',
  headers: {},
  body: '{"ok":true}',
  bodyParsed: { ok: true },
  isJson: true,
  durationMs: 12,
}

function renderConsole(onCreateDoc = vi.fn()) {
  return {
    onCreateDoc,
    ...render(
      <ToastProvider>
        <TesterResponseConsole
          status="success"
          errorMessage={null}
          response={response}
          requestSnapshot={null}
          onCreateDoc={onCreateDoc}
        />
      </ToastProvider>,
    ),
  }
}

describe('TesterResponseConsole import confirmation', () => {
  it('only imports after confirmation and closes on cancel', async () => {
    const user = userEvent.setup()
    const { onCreateDoc, getByRole, queryByRole } = renderConsole()

    await user.click(getByRole('button', { name: 'Import to Builder' }))
    expect(getByRole('dialog')).toBeTruthy()

    await user.click(getByRole('button', { name: 'Cancel' }))
    expect(queryByRole('dialog')).toBeNull()
    expect(onCreateDoc).not.toHaveBeenCalled()

    await user.click(getByRole('button', { name: 'Import to Builder' }))
    await user.click(within(getByRole('dialog')).getByRole('button', { name: 'Import to Builder' }))
    expect(onCreateDoc).toHaveBeenCalledOnce()
    expect(queryByRole('dialog')).toBeNull()
  })

  it('dismisses when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = renderConsole()

    await user.click(getByRole('button', { name: 'Import to Builder' }))
    const dialog = getByRole('dialog')
    fireEvent.click(dialog.parentElement as HTMLElement)

    expect(queryByRole('dialog')).toBeNull()
  })
})
