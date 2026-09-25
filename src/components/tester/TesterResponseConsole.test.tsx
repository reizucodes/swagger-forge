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

function renderConsole(onCreateDoc = vi.fn(), onClearHistory = vi.fn(), responseOverride = response) {
  return {
    onCreateDoc,
    onClearHistory,
    ...render(
      <ToastProvider>
        <TesterResponseConsole
          status="success"
          errorMessage={null}
          response={responseOverride}
          requestSnapshot={null}
          requestHistory={[{ id: 1, timestamp: 1700000000000, snapshot: { method: 'GET', url: 'https://example.test', headers: {}, body: undefined } }]}
          onClearHistory={onClearHistory}
          onCreateDoc={onCreateDoc}
        />
      </ToastProvider>,
    ),
  }
}

describe('TesterResponseConsole import confirmation', () => {
  it('only imports after confirmation and closes on cancel', async () => {
    const user = userEvent.setup()
    const { onCreateDoc, getByRole, getByText, queryByRole } = renderConsole()

    expect(queryByRole('button', { name: 'Import to Builder' })).toBeNull()
    await user.click(getByText('200 OK'))

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
    const { getByRole, getByText, queryByRole } = renderConsole()

    await user.click(getByText('200 OK'))
    await user.click(getByRole('button', { name: 'Import to Builder' }))
    const dialog = getByRole('dialog')
    fireEvent.click(dialog.parentElement as HTMLElement)

    expect(queryByRole('dialog')).toBeNull()
  })
})

describe('TesterResponseConsole history controls', () => {
  it('exposes a clear history button', async () => {
    const user = userEvent.setup()
    const { onClearHistory, getByRole } = renderConsole()

    await user.click(getByRole('button', { name: /^Clear/ }))

    expect(onClearHistory).toHaveBeenCalledOnce()
  })

  it('uses the Console label and does not render collapsed response details', () => {
    const { container, getByText } = renderConsole()

    expect(getByText('Console')).toBeTruthy()
    expect(container.textContent).not.toContain('Response body copied')
    expect(container.querySelector('button[aria-label="Import to Builder"]')).toBeNull()
  })

  it('truncates large response bodies for display and can show the full body', async () => {
    const user = userEvent.setup()
    const longBody = `prefix-${'x'.repeat(5_000)}-suffix`
    const { getByText, getByRole, container } = renderConsole(
      vi.fn(),
      vi.fn(),
      { ...response, body: longBody, isJson: false },
    )

    await user.click(getByText('200 OK'))
    expect(getByRole('button', { name: 'Show more' })).toBeTruthy()
    expect(container.querySelector('pre')?.textContent).not.toContain('suffix')

    await user.click(getByRole('button', { name: 'Show more' }))
    expect(getByRole('button', { name: 'Truncate' })).toBeTruthy()
    expect(container.querySelector('pre')?.textContent).toContain('suffix')
  })

  it('does not show a truncation control when the response has no body', async () => {
    const user = userEvent.setup()
    const { getByText, queryByRole } = renderConsole(vi.fn(), vi.fn(), { ...response, body: '' })

    await user.click(getByText('200 OK'))
    expect(queryByRole('button', { name: 'Show more' })).toBeNull()
    expect(queryByRole('button', { name: 'Truncate' })).toBeNull()
  })

  it('keeps log entries collapsed when new history entries arrive', () => {
    const { container, rerender } = renderConsole()
    expect(container.querySelector('details')?.open).toBe(false)

    rerender(
      <ToastProvider>
        <TesterResponseConsole
          status="success"
          errorMessage={null}
          response={response}
          requestSnapshot={null}
          requestHistory={[
            { id: 1, timestamp: 1700000000000, snapshot: { method: 'GET', url: 'https://example.test/1', headers: {}, body: undefined } },
            { id: 2, timestamp: 1700000001000, snapshot: { method: 'GET', url: 'https://example.test/2', headers: {}, body: undefined } },
          ]}
          onCreateDoc={vi.fn()}
        />
      </ToastProvider>,
    )

    expect(Array.from(container.querySelectorAll('details')).every(details => !details.open)).toBe(true)
  })

})
