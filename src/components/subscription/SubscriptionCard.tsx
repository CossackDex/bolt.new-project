import React, { useState } from 'react'
import { Check, Crown, Loader2 } from 'lucide-react'
import { StripeProduct, formatPrice } from '../../stripe-config'
import { supabase } from '../../lib/supabase'

interface SubscriptionCardProps {
  product: StripeProduct
  isCurrentPlan?: boolean
  onSuccess?: () => void
}

export function SubscriptionCard({ product, isCurrentPlan, onSuccess }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Please sign in to subscribe')
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start subscription process')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
      isCurrentPlan ? 'border-green-500' : 'border-gray-200 hover:border-blue-300'
    } transition-all duration-200`}>
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
            <Crown className="h-4 w-4 mr-1" />
            Current Plan
          </div>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-6">{product.description}</p>
        
        <div className="mb-8">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-gray-600 ml-2">/month</span>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Unlimited Projects</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Advanced Task Management</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Cost Tracking & Analytics</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Priority Support</span>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading || isCurrentPlan}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </div>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : (
            `Subscribe to ${product.name}`
          )}
        </button>
      </div>
    </div>
  )
}