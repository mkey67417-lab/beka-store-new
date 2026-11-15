/*
# Payer account on orders, and users can read their own orders

1. Modified table: orders
- New optional column `payer_account`: the account or phone number the customer paid from (Fawry or My Cashi).
- Guests can fill it at checkout.

2. Security
- Signed-in users can read only their own orders (rows where user_id matches their account).
- Guests cannot read orders; they keep insert-only access.
- Grants: authenticated users get SELECT on orders, plus the insert grant for payer_account.

3. Notes
- Existing orders are unchanged.
*/

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payer_account text
  CHECK (payer_account IS NULL OR char_length(payer_account) BETWEEN 3 AND 30);

GRANT INSERT (payer_account) ON public.orders TO anon, authenticated;

GRANT SELECT ON public.orders TO authenticated;

DROP POLICY IF EXISTS "read_own_orders" ON public.orders;
CREATE POLICY "read_own_orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
