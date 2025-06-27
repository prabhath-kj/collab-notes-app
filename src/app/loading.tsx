'use client'

import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-6 flex items-center gap-3">
        <Loader2 className="animate-spin text-black/60" />
        <span className="text-sm font-medium text-muted-foreground">Loading, please wait...</span>
      </Card>
    </div>
  )
}
