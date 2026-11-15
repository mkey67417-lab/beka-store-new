/*
# Owner can read all orders and all payment methods

1. Changes
- Adds an owner-only SELECT policy on `orders` so the admin panel can list every order.
- Adds an owner-only SELECT policy on `payment_methods` so the admin panel can see inactive methods and re-enable them.

2. Security
- Both policies check `is_owner()`, so regular customers still only see their own orders and only active payment methods.
- Grants SELECT to `authenticated` on both tables (RLS still decides which rows are visible).
*/

DROP POLICY IF EXISTS "owner_read_all_orders" ON orders;
CREATE POLICY "owner_read_all_orders"
ON orders FOR SELECT
TO authenticated
USING (is_owner());

DROP POLICY IF EXISTS "owner_read_all_payment_methods" ON payment_methods;
CREATE POLICY "owner_read_all_payment_methods"
ON payment_methods FOR SELECT
TO authenticated
USING (is_owner());

GRANT SELECT ON orders, payment_methods TO authenticated;
