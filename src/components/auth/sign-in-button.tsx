'use client'

import { signIn } from 'next-auth/react'
import { Button, ButtonProps } from '@/components/ui/button'
import { LogIn } from 'lucide-react'

interface SignInButtonProps extends Omit<ButtonProps, 'onClick'> {
  provider?: string
  onSignIn?: () => void
}

export function SignInButton({ 
  provider = 'google',
  onSignIn,
  children = 'Sign In',
  ...props 
}: SignInButtonProps) {
  const handleSignIn = async () => {
    try {
      await signIn(provider, { callbackUrl: '/' })
      onSignIn?.()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <Button onClick={handleSignIn} {...props}>
      <LogIn className="mr-2 h-4 w-4" />
      {children}
    </Button>
  )
}
