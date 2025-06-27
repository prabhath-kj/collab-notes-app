'use client'

import { Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorPageProps {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Alert variant="destructive" className="max-w-md w-full mx-auto">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </AlertDescription>
        <div className="mt-4">
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
        </div>
      </Alert>
    </div>
  )
}
