/*
  # Fix Subscription View

  1. Changes
    - Drop and recreate `stripe_user_subscriptions` view
    - Fix LEFT JOIN condition to properly handle users without subscriptions
    - Move deleted_at check to JOIN condition instead of WHERE clause

  2. Details
    - The previous view used AND in WHERE clause after LEFT JOIN
    - This converted the LEFT JOIN to an INNER JOIN
    - Users without subscriptions weren't returned at all
    - Now users are returned even if they don't have a subscription yet
*/

DROP VIEW IF EXISTS stripe_user_subscriptions;

CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s 
    ON c.customer_id = s.customer_id 
    AND s.deleted_at IS NULL
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL;

GRANT SELECT ON stripe_user_subscriptions TO authenticated;