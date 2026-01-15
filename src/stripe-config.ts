export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  currency: string;
  currencySymbol: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1SpHKWGELwnF1q56qhB2f5Dp',
    name: 'ExtraProConstruction Site',
    description: 'kakakakak',
    mode: 'subscription',
    price: 50.00,
    currency: 'pln',
    currencySymbol: 'zł'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};