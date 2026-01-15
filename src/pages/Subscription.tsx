import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Crown, Check, X, ArrowLeft } from 'lucide-react';

interface SubscriptionPageProps {
  onBack: () => void;
}

export default function SubscriptionPage({ onBack }: SubscriptionPageProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      setSubscription(data);
    }
    setLoading(false);
  };

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    alert('Stripe checkout would open here. To enable payments, configure Stripe following the instructions at: https://bolt.new/setup/stripe');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const features = {
    free: [
      'Up to 3 projects',
      'Unlimited tasks per project',
      'Sub-tasks with cost tracking',
      'Priority levels',
      'Deadline tracking',
      'Notes on tasks and projects',
    ],
    premium: [
      'Unlimited projects',
      'Everything in Free',
      'Priority support',
      'Advanced reporting (coming soon)',
      'Team collaboration (coming soon)',
      'Export to PDF (coming soon)',
    ],
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-4">
          <Crown className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Upgrade to Premium
        </h1>
        <p className="text-xl text-slate-600">
          Unlock unlimited projects and access all features
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Free Plan</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">$0</span>
              <span className="text-slate-600">/month</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {features.free.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{feature}</span>
              </li>
            ))}
          </ul>

          {subscription?.subscription_tier === 'free' && (
            <div className="bg-slate-100 text-slate-700 text-center py-3 rounded-lg font-semibold">
              Current Plan
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl border-2 border-amber-400 p-8 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="bg-white text-amber-600 px-3 py-1 rounded-full text-sm font-bold">
              POPULAR
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Premium Plan</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="opacity-90">/month</span>
            </div>
            <p className="text-amber-100 text-sm mt-2">Or $99/year (save 17%)</p>
          </div>

          <ul className="space-y-4 mb-8">
            {features.premium.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {subscription?.subscription_tier === 'premium' ? (
            <div className="bg-white text-amber-600 text-center py-3 rounded-lg font-semibold">
              Current Plan
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => handleUpgrade('monthly')}
                className="w-full bg-white text-amber-600 hover:bg-amber-50 py-3 rounded-lg font-bold transition"
              >
                Upgrade to Monthly
              </button>
              <button
                onClick={() => handleUpgrade('annual')}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-bold transition"
              >
                Upgrade to Annual
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-100 rounded-xl p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Can I cancel anytime?</h4>
            <p className="text-slate-600">
              Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">What happens to my projects if I downgrade?</h4>
            <p className="text-slate-600">
              Your projects and data remain safe. However, you'll need to delete projects down to the free tier limit of 3 to continue accessing them.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Do you offer refunds?</h4>
            <p className="text-slate-600">
              Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact support for a full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
