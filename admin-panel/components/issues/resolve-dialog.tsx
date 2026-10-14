'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import type { IssueResolution } from '@/lib/types'

interface ResolveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issueId: number | null
  onConfirm: (resolution: IssueResolution, note: string) => void
  isPending: boolean
}

const RESOLUTION_OPTIONS: { value: IssueResolution; label: string }[] = [
  { value: 'FIXED', label: 'Fixed' },
  { value: 'IGNORED', label: 'Ignored' },
  { value: 'DUPLICATE', label: 'Duplicate' },
  { value: 'INVALID', label: 'Invalid' },
]

export function ResolveDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: ResolveDialogProps) {
  const [resolution, setResolution] = useState<IssueResolution | ''>('')
  const [note, setNote] = useState('')

  useEffect(() => {
    setResolution('')
    setNote('')
  }, [open])

  const handleConfirm = () => {
    if (!resolution) return
    onConfirm(resolution, note.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select
              value={resolution}
              onValueChange={(v) => setResolution(v as IssueResolution)}
            >
              <SelectTrigger id="resolution" className="cursor-pointer">
                <SelectValue placeholder="Select resolution..." />
              </SelectTrigger>
              <SelectContent>
                {RESOLUTION_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="cursor-pointer"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-note">Admin Note (optional)</Label>
            <Textarea
              id="admin-note"
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !resolution}
            className="bg-green-500 hover:bg-green-600 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Resolve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
