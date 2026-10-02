'use client'

import { useState } from 'react'
import { AlertTriangle, MapPin, CheckCircle2, Loader2, X } from 'lucide-react'
import { triggerPointCelebration } from './point-celebration-toast'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const ISSUE_TYPES = [
  { value: 'overflowing_bin', label: '🗑️ Overflowing Bin', desc: 'Waste is spilling over onto walkways' },
  { value: 'damaged_bin', label: '⚠️ Broken Bin / Lid', desc: 'Bin is cracked, broken, or missing a cover' },
  { value: 'litter_hotspot', label: '🧹 Litter Hotspot', desc: 'Significant litter accumulated in this area' },
  { value: 'hazardous_waste', label: '☣️ Hazardous Material', desc: 'Spilled chemical, paint, or sharp objects' },
  { value: 'other', label: '❓ Other Issue', desc: 'General campus cleanliness or bin request' },
]

const POPULAR_LOCATIONS = [
  'Library Block - Ground Floor',
  'Student Centre - Cafeteria',
  'Hostel A - Common Area',
  'Hostel B - Entrance',
  'Hostel C - Dining Hall',
  'IT Department - First Floor',
  'Main Admin Office Corridor',
  'Science Block - Bay Area',
]

export function ReportWasteModal({ open, onClose, onSuccess }: Props) {
  const [locationName, setLocationName] = useState('')
  const [issueType, setIssueType] = useState('overflowing_bin')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!locationName.trim()) {
      setErrorMsg('Please specify the campus location.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/eco-points/report-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: locationName.trim(),
          issueType,
          description: description.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit waste report')
      }

      setSuccess(true)
      triggerPointCelebration({
        points: 10,
        actionTitle: 'Report Waste Issue',
        newTotal: data.newTotal,
        isLevelUp: data.isLevelUp,
        newLevelName: data.currentLevel?.name,
        newLevelEmoji: data.currentLevel?.emoji,
      })

      if (onSuccess) onSuccess()

      setTimeout(() => {
        setSuccess(false)
        setLocationName('')
        setDescription('')
        onClose()
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-page-in">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/20 text-primary">
              <CheckCircle2 className="size-6 animate-pulse" />
            </div>
            <h3 className="font-display text-lg font-bold">Report Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for keeping our campus clean. <br />
              <strong className="text-primary">+10 Eco Points</strong> have been added to your profile!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold">Report Waste Issue</h3>
                <p className="text-xs text-muted-foreground">
                  Help facilities locate problem spots. Earn <strong className="text-primary">+10 Eco Points</strong>.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {errorMsg}
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Campus Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground/60" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Library Block - Ground Floor near entrance"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Quick suggestions */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocationName(loc)}
                    className="rounded-lg border border-border bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    {loc.split(' - ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Category */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Issue Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ISSUE_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 cursor-pointer text-left transition-colors ${
                      issueType === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card/40 hover:border-primary/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="issueType"
                      value={type.value}
                      checked={issueType === type.value}
                      onChange={() => setIssueType(type.value)}
                      className="mt-0.5 sr-only"
                    />
                    <div>
                      <p className="text-xs font-medium">{type.label}</p>
                      <p className="text-[10px] text-muted-foreground">{type.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional details */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Describe what needs attention..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/60 p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                Submit Report (+10 pts)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
