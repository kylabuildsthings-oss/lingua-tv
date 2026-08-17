interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'REMOVE',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <div className="pixel-border w-full max-w-md bg-card p-4">
        <h2 className="mb-3 text-[12px] text-white">{title}</h2>
        <p className="mb-5 text-[8px] leading-relaxed text-purple-pale">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="pixel-btn bg-purple-mid" onClick={onCancel}>
            CANCEL
          </button>
          <button type="button" className="pixel-btn" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
