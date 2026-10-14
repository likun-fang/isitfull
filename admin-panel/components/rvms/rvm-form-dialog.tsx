'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import type { Rvm, RvmRequest } from '@/lib/types'

interface RvmFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rvm: Rvm | null
  onSubmit: (data: RvmRequest) => void
  isPending: boolean
}

const EMPTY_FORM: RvmRequest = {
  name: '',
  city: '',
  postalCode: '',
  latitude: 0,
  longitude: 0,
  openHours: '',
  externalId: '',
}

function formFromRvm(rvm: Rvm): RvmRequest {
  return {
    name: rvm.name,
    city: rvm.city,
    postalCode: rvm.postalCode ?? '',
    latitude: rvm.latitude,
    longitude: rvm.longitude,
    openHours: rvm.openHours ?? '',
    externalId: rvm.externalId ?? '',
  }
}

export function RvmFormDialog({
  open,
  onOpenChange,
  rvm,
  onSubmit,
  isPending,
}: RvmFormDialogProps) {
  const [form, setForm] = useState<RvmRequest>(EMPTY_FORM)
  const isEdit = rvm !== null

  useEffect(() => {
    if (open) {
      setForm(rvm ? formFromRvm(rvm) : EMPTY_FORM)
    }
  }, [open, rvm])

  const updateField = (field: keyof RvmRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    })
  }

  const isValid = form.name.trim() !== '' && form.city.trim() !== ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit RVM' : 'Add RVM'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={form.postalCode ?? ''}
                onChange={(e) => updateField('postalCode', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => updateField('latitude', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => updateField('longitude', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openHours">Open Hours</Label>
            <Input
              id="openHours"
              value={form.openHours ?? ''}
              onChange={(e) => updateField('openHours', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="externalId">External ID</Label>
            <Input
              id="externalId"
              value={form.externalId ?? ''}
              onChange={(e) => updateField('externalId', e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending || !isValid}
              className="cursor-pointer bg-green-500 hover:bg-green-600"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
