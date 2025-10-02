import { render, screen, waitFor } from '@testing-library/react'
import { MockServiceBanner } from '@/components/mock-service-banner'

jest.mock('@/lib/mock-config', () => ({
  getServiceStatus: () => ({
    database: 'connected',
    sportsData: 'connected',
    kyc: 'connected',
  }),
}))

describe('MockServiceBanner', () => {
  it('formats service names for display', async () => {
    render(<MockServiceBanner />)

    await waitFor(() => {
      expect(screen.getByText('Sports Data')).toBeInTheDocument()
      expect(screen.getByText('KYC')).toBeInTheDocument()
    })
  })

  it('exposes an accessible control to dismiss the banner', async () => {
    render(<MockServiceBanner />)

    const dismissButton = await screen.findByRole('button', {
      name: /dismiss development mode notice/i,
    })

    expect(dismissButton).toBeInTheDocument()
  })
})
