import { useState } from 'react';
import { Check, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { StripeProduct } from '../stripe-config';

interface PricingCardProps {
  product: StripeProduct;
  isPopular?: boolean;
  onSubscribe: (priceId: string) => Promise<void>;
}

export function PricingCard({ product, isPopular = false, onSubscribe }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await onSubscribe(product.priceId);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Unlimited projects',
    'Advanced task management',
    'Real-time cost tracking',
    'Priority email support',
    'Team collaboration',
    'Custom reports',
  ];

  return (
    <div className={`relative card-elevated overflow-hidden transition-all duration-300 ${
      isPopular
        ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/10'
        : ''
    }`}>
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-500 py-2 text-center">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4" />
            Most Popular
          </span>
        </div>
      )}

      <div className={`p-8 ${isPopular ? 'pt-14' : ''}`}>
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{product.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{product.description}</p>

          <div className="flex items-baseline justify-center gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-2xl">{product.currencySymbol}</span>
            <span className="text-5xl font-bold text-slate-900 dark:text-white">{product.price}</span>
            <span className="text-slate-500 dark:text-slate-400 ml-1">
              /{product.mode === 'subscription' ? 'month' : 'one-time'}
            </span>
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isPopular
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Get Started
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          Cancel anytime. No hidden fees.
        </p>
      </div>
    </div>
  );
}
