'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button, ButtonProps } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

type ConnectButtonRenderProps = {
  account?: {
    displayName: string
    displayBalance?: string
  } | null
  chain?: {
    unsupported?: boolean
  } | null
  mounted: boolean
  openAccountModal: () => void
  openChainModal: () => void
  openConnectModal: () => void
}

interface ConnectWalletButtonProps extends Omit<ButtonProps, 'onClick'> {
  onConnect?: () => void
}

interface WalletButtonContentProps extends ConnectButtonRenderProps {
  buttonProps: Omit<ButtonProps, 'onClick'>
  label: ReactNode
  onConnect?: () => void
}

function WalletButtonContent({
  account,
  chain,
  mounted,
  openAccountModal,
  openChainModal,
  openConnectModal,
  buttonProps,
  label,
  onConnect,
}: WalletButtonContentProps) {
  const hasConnectedRef = useRef(false)
  const ready = mounted
  const connected = Boolean(ready && account && chain)

  useEffect(() => {
    if (connected) {
      if (!hasConnectedRef.current && onConnect) {
        hasConnectedRef.current = true
        onConnect()
      }
    } else {
      hasConnectedRef.current = false
    }
  }, [connected, onConnect])

  if (!ready) {
    return (
      <Button disabled {...buttonProps}>
        <Wallet className="mr-2 h-4 w-4" />
        {label}
      </Button>
    )
  }

  if (!connected || !account || !chain) {
    return (
      <Button onClick={openConnectModal} {...buttonProps}>
        <Wallet className="mr-2 h-4 w-4" />
        {label}
      </Button>
    )
  }

  if (chain.unsupported) {
    return (
      <Button onClick={openChainModal} variant="destructive" {...buttonProps}>
        Wrong network
      </Button>
    )
  }

  return (
    <Button onClick={openAccountModal} {...buttonProps}>
      <Wallet className="mr-2 h-4 w-4" />
      {account.displayName}
      {account.displayBalance ? ` (${account.displayBalance})` : ''}
    </Button>
  )
}

export function ConnectWalletButton({
  onConnect,
  children = 'Connect Wallet',
  ...props
}: ConnectWalletButtonProps) {
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

  if (!walletConnectProjectId) {
    return (
      <Button disabled {...props}>
        <Wallet className="mr-2 h-4 w-4" />
        {children}
      </Button>
    )
  }

  return (
    <ConnectButton.Custom>
      {(renderProps) => (
        <WalletButtonContent
          {...renderProps}
          buttonProps={props}
          label={children}
          onConnect={onConnect}
        />
      )}
    </ConnectButton.Custom>
  )
}
