import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { PricingCard } from '../components/PricingCard';
import { stripeProducts } from '../stripe-config';
import { supabase } from '../lib/supabase';
import { Check, Zap, Shield, Clock } from 'lucide-react';

export function Pricing() {
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/pricing`,
          mode: 'subscription',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout error response:', errorData);
        alert(`Error: ${errorData.error || 'Failed to create checkout session'}`);
        return;
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned:', data);
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const features = [
    { icon: Zap, text: 'Unlimited projects' },
    { icon: Shield, text: 'Priority support' },
    { icon: Clock, text: 'Advanced analytics' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(148 163 184) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 animate-fadeIn">
              <Zap className="w-4 h-4" />
              Simple, transparent pricing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 animate-fadeInUp">
              Choose the perfect plan
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                for your projects
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              Start free and scale as you grow. Upgrade anytime to unlock powerful features for professional construction management.
            </p>
          </div>

          <div className="max-w-lg mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            {stripeProducts.map((product, index) => (
              <PricingCard
                key={product.priceId}
                product={product}
                isPopular={index === 0}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
              Everything you need to succeed
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="card p-6 text-center animate-fadeInUp"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-20">
            <div className="card-elevated p-8 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Included in all plans</h3>
                  <p className="text-slate-300 mb-4">Every plan comes with essential features to manage your construction projects effectively.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Project tracking', 'Task management', 'Cost monitoring', 'Mobile access', 'Secure data', 'Export reports'].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-sm text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
