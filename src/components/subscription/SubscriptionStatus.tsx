import React from 'react'
import { Crown, AlertCircle, Clock } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { formatPrice } from '../../stripe-config'

export function SubscriptionStatus() {
  const { subscription, loading, getSubscriptionPlan, isActive, isPending } = useSubscription()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  const plan = getSubscriptionPlan()

  if (!subscription || !plan) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Free Plan</h3>
            <p className="text-sm text-yellow-700">Limited to 3 projects</p>
          </div>
        </div>
      </div>
    )
  }

  if (isPending()) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Subscription Pending</h3>
            <p className="text-sm text-blue-700">Your {plan.name} subscription is being processed</p>
          </div>
        </div>
      </div>
    )
  }

  if (isActive()) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Crown className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800">{plan.name}</h3>
            <p className="text-sm text-green-700">
              {formatPrice(plan.price, plan.currency)}/month • Unlimited projects
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-red-800">Subscription Issue</h3>
          <p className="text-sm text-red-700">Please check your payment method</p>
        </div>
      </div>
    </div>
  )
}