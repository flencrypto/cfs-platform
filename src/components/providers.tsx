'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import {
  RainbowKitProvider,
  connectorsForWallets,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit'
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets'
import { useState } from 'react'

const isNotFoundError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    if ('status' in error && typeof (error as { status?: number }).status === 'number') {
      return (error as { status?: number }).status === 404
    }
    if ('response' in error) {
      const response = (error as { response?: { status?: number } }).response
      if (response && typeof response.status === 'number') {
        return response.status === 404
      }
    }
  }
  return false
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, arbitrum, optimism],
  [publicProvider()],
)

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? process.env.WALLETCONNECT_PROJECT_ID

if (!walletConnectProjectId) {
  console.warn(
    'WalletConnect project id is not set. Wallet connectors will be limited to injected wallets in this environment.',
  )
}

const walletConnectorSetup = walletConnectProjectId
  ? getDefaultWallets({
      appName: 'CFS - Crypto Fantasy Sports',
      projectId: walletConnectProjectId,
      chains,
    })
  : null

const fallbackConnectors = connectorsForWallets([
  {
    groupName: 'Detected',
    wallets: [injectedWallet({ chains })],
  },
])

type WagmiConnectors = NonNullable<Parameters<typeof createConfig>[0]['connectors']>

const connectors: WagmiConnectors = walletConnectorSetup?.connectors ?? fallbackConnectors

const wagmiConfig = createConfig({
  autoConnect: Boolean(walletConnectorSetup),
  connectors,
  publicClient,
  webSocketPublicClient,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              if (isNotFoundError(error)) {
                return false
              }
              return failureCount < 3
            },
          },
        },
      }),
  )

  const enableWallets = connectors.length > 0

  const themeProvider = (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </ThemeProvider>
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          {enableWallets ? (
            <RainbowKitProvider
              chains={chains}
              modalSize="compact"
              showRecentTransactions={Boolean(walletConnectProjectId)}
            >
              {themeProvider}
            </RainbowKitProvider>
          ) : (
            themeProvider
          )}
        </WagmiConfig>
      </QueryClientProvider>
    </SessionProvider>
  )
}
