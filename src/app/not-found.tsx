'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Alert variant="destructive" className="max-w-md w-full mx-auto">
        <Ban className="h-4 w-4" />
        <AlertTitle>404 – Page Not Found</AlertTitle>
        <AlertDescription>
          Sorry, we couldn’t find the page you were looking for.
        </AlertDescription>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </Alert>
    </div>
  )
}
