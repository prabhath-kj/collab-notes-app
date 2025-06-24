'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

import { IUserSignIn } from '@/lib/types'
import { UserSignInSchema } from '@/lib/validator'
import { loginUser } from '@/lib/actions/user.actions'

export default function SignInPage() {
  const router = useRouter()
//   const setAuthenticated = useAuthStore((s) => s.setAuthenticated)

  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: IUserSignIn) => {
    try {
      const res = await loginUser(data)

      if (!res?.success) {
        toast.warning(res.message || 'Invalid credentials')
        return
      }

      localStorage.setItem('token', res.token||'') 
      toast.success('Logged in successfully!')
      router.push('/notes')
    } catch (err: any) {
      toast.error(err?.message || 'Unexpected error occurred')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white  rounded-2xl shadow-sm p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-1">Access your notes dashboard</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full rounded-md">
              {form.formState.isSubmitting ? 'Logging in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        <p className="text-sm text-center text-gray-500">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
