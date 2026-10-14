'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface KarmaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  currentKarma: number
  isPending: boolean
  onConfirm: (points: number, reason: string) => void
}

export function KarmaDialog({ open, onOpenChange, userName, currentKarma, isPending, onConfirm }: KarmaDialogProps) {
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = parseInt(points, 10)
    if (isNaN(p) || !reason.trim()) return
    onConfirm(p, reason.trim())
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setPoints(''); setReason('') } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Karma</DialogTitle>
          <DialogDescription>
            Adjust karma for <strong>{userName}</strong>. Current: <strong>{currentKarma}</strong> points.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="points">Points (+/-)</Label>
            <Input
              id="points"
              type="number"
              placeholder="e.g. 10 or -5"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder="Reason for adjustment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !points || !reason.trim()} className="bg-green-500 hover:bg-green-600 cursor-pointer">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Adjust
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
