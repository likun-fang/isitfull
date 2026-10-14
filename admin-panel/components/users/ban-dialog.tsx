'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'

interface BanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  isBanned: boolean
  isPending: boolean
  onConfirm: () => void
}

export function BanDialog({ open, onOpenChange, userName, isBanned, isPending, onConfirm }: BanDialogProps) {
  const action = isBanned ? 'unban' : 'ban'
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBanned ? 'Unban' : 'Ban'} User
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action} <strong>{userName}</strong>?
            {!isBanned && ' This will prevent the user from accessing the app.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className={`cursor-pointer ${isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isBanned ? 'Unban' : 'Ban'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
