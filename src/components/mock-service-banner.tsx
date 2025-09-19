'use client'

import { useState, useEffect } from 'react'
import { getServiceStatus } from '@/lib/mock-config'
import { CheckCircle, XCircle, AlertCircle, Wifi } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function MockServiceBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [serviceStatus, setServiceStatus] = useState<Record<string, string>>({})

  useEffect(() => {
    setServiceStatus(getServiceStatus())
  }, [])

  if (!isVisible) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'fallback':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'disconnected':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'fallback':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Development Mode</span>
            </div>
            <Badge variant="outline" className="border-blue-300 text-blue-700">
              Mock Services Active
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            ×
          </Button>
        </div>
        
        <div className="mt-3 text-sm text-blue-700">
          <p className="mb-2">
            This app is running in development mode with mock services.
            All integrations are simulated and will work as if they&rsquo;re connected.
          </p>
          
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(serviceStatus).map(([service, status]) => (
              <div
                key={service}
                className={`flex items-center space-x-2 rounded-md border px-2 py-1 text-xs ${getStatusColor(status)}`}
              >
                {getStatusIcon(status)}
                <span className="capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
