'use client'
import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Admin Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter admin password"
          required
          autoComplete="current-password"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
