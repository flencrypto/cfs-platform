'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button, ButtonProps } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

interface ConnectWalletButtonProps extends Omit<ButtonProps, 'onClick'> {
  onConnect?: () => void
}

export function ConnectWalletButton({ 
  onConnect, 
  children = 'Connect Wallet',
  ...props 
}: ConnectWalletButtonProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        if (!ready) {
          return (
            <Button disabled {...props}>
              <Wallet className="mr-2 h-4 w-4" />
              {children}
            </Button>
          )
        }

        if (!connected) {
          return (
            <Button onClick={openConnectModal} {...props}>
              <Wallet className="mr-2 h-4 w-4" />
              {children}
            </Button>
          )
        }

        if (chain.unsupported) {
          return (
            <Button onClick={openChainModal} variant="destructive" {...props}>
              Wrong network
            </Button>
          )
        }

        return (
          <Button onClick={openAccountModal} {...props}>
            <Wallet className="mr-2 h-4 w-4" />
            {account.displayName}
            {account.displayBalance ? ` (${account.displayBalance})` : ''}
          </Button>
        )
      }}
    </ConnectButton.Custom>
  )
}
