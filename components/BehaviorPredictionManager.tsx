"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface BehaviorPrediction {
  id: string
  type: 'route' | 'alert' | 'weather_check' | 'location_change'
  confidence: number
  prediction: string
  reasoning: string
  timestamp: Date
}

interface BehaviorPredictionManagerProps {
  userId?: string
  enabled?: boolean
  className?: string
}

export function BehaviorPredictionManager({ 
  userId,
  enabled = true,
  className = ''
}: BehaviorPredictionManagerProps) {
  const [predictions, setPredictions] = useState<BehaviorPrediction[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (!enabled) return

    // Mock behavior analysis
    const analyzeBehavior = () => {
      setIsAnalyzing(true)
      
      // Simulate ML predictions based on user patterns
      const mockPredictions: BehaviorPrediction[] = [
        {
          id: '1',
          type: 'weather_check',
          confidence: 0.85,
          prediction: 'User likely to check weather at 7 AM',
          reasoning: 'Historical pattern: User checks weather daily at 7:00-7:30 AM',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'route',
          confidence: 0.72,
          prediction: 'User may plan route to work',
          reasoning: 'Weekday morning pattern detected',
          timestamp: new Date()
        }
      ]

      setTimeout(() => {
        setPredictions(mockPredictions)
        setIsAnalyzing(false)
      }, 1000)
    }

    analyzeBehavior()
    const interval = setInterval(analyzeBehavior, 300000) // Every 5 minutes

    return () => clearInterval(interval)
  }, [enabled, userId])

  if (!enabled) return null

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather_check':
        return <CheckCircle className="h-4 w-4" />
      case 'route':
        return <TrendingUp className="h-4 w-4" />
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-600" />
          Behavior Predictions
          {isAnalyzing && (
            <Badge variant="outline" className="ml-auto">
              Analyzing...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Analyzing user behavior patterns...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map((pred) => (
              <div
                key={pred.id}
                className="p-3 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`p-2 rounded ${getConfidenceColor(pred.confidence)}`}>
                    {getTypeIcon(pred.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {pred.prediction}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(pred.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{pred.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            Predictions based on ML analysis of usage patterns
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BehaviorPredictionManager
