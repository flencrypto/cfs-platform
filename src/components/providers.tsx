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
import { useEffect, useState } from 'react'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, arbitrum, optimism],
  [publicProvider()],
)

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

const walletConnectConfig = walletConnectProjectId
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

const wagmiConfig = createConfig({
  autoConnect: Boolean(walletConnectConfig),
  connectors: walletConnectConfig?.connectors ?? fallbackConnectors,
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
            retry: (failureCount, error: any) => {
              if (error?.status === 404) return false
              if (failureCount < 3) return true
              return false
            },
          },
        },
      }),
  )

  useEffect(() => {
    if (!walletConnectConfig && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        '[walletconnect] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect is disabled; falling back to injected wallets only.',
      )
    }
  }, [])

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider
            chains={chains}
            modalSize="compact"
            showRecentTransactions={Boolean(walletConnectConfig)}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </ThemeProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </QueryClientProvider>
    </SessionProvider>
  )
}
