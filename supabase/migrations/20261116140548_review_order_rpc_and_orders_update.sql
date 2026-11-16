/*
# Add order review RPC and owner update policy

## Summary
Adds a `review_order` SECURITY DEFINER function that lets the store owner
approve or reject game top-up orders. On approval, it deducts the order
amount from the customer's wallet balance and marks the order `completed`.
On rejection, it marks the order `rejected`. Also adds a `reviewed_at`
column to `orders`, grants UPDATE to `authenticated`, and adds an
owner-only UPDATE RLS policy.

## Changes

### 1. `orders` table
- Adds `reviewed_at timestamptz` column (nullable) to track when the
  owner reviewed the order.

### 2. `review_order` function (SECURITY DEFINER)
- Arguments: `p_order_id uuid`, `p_approve boolean`
- Checks `is_owner()` — raises `NOT_OWNER` if false.
- Locks the order row for update.
- Validates the order exists and is still `pending`.
- If `p_approve`:
  - Deducts `amount_sdg` from `profiles.balance` for the order's
    `user_id` (only if the user has a wallet — guest orders with
    `user_id = null` are simply marked completed without deduction).
  - Sets `status = 'completed'`, `reviewed_at = now()`.
- If not `p_approve`:
  - Sets `status = 'rejected'`, `reviewed_at = now()`.

### 3. Grants
- `GRANT UPDATE ON orders TO authenticated` — needed so the owner
  can call the RPC (the RPC itself runs as definer, but the Data API
  path requires the role to have the privilege).
- `GRANT EXECUTE ON review_order TO authenticated`.
- `REVOKE EXECUTE ON review_order FROM anon` — prevents anonymous
  callers from reviewing orders.

### 4. RLS policies
- `owner_update_orders` — `FOR UPDATE TO authenticated USING (is_owner())`
  so only the owner can update order rows directly.

### Security notes
- The function is SECURITY DEFINER with `search_path = ''` (safe).
- `is_owner()` checks the caller's `raw_app_meta_data.role = 'owner'`.
- Anonymous users cannot call `review_order`.
- Only the owner sees orders via the existing `owner_read_all_orders`
  SELECT policy.
*/

-- 1. Add reviewed_at column to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- 2. Create review_order function
CREATE OR REPLACE FUNCTION public.review_order(p_order_id uuid, p_approve boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_row public.orders%ROWTYPE;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'NOT_OWNER' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_row FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
  IF v_row.status <> 'pending' THEN
    RAISE EXCEPTION 'ALREADY_REVIEWED';
  END IF;

  IF p_approve THEN
    -- Deduct from customer wallet if they have an account
    IF v_row.user_id IS NOT NULL THEN
      UPDATE public.profiles
        SET balance = balance - v_row.amount_sdg
        WHERE id = v_row.user_id;
    END IF;
    UPDATE public.orders
      SET status = 'completed', reviewed_at = now()
      WHERE id = p_order_id;
  ELSE
    UPDATE public.orders
      SET status = 'rejected', reviewed_at = now()
      WHERE id = p_order_id;
  END IF;
END;
$$;

-- 3. Revoke from anon, grant to authenticated
REVOKE EXECUTE ON FUNCTION public.review_order(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_order(uuid, boolean) TO authenticated;

-- 4. Grant UPDATE on orders to authenticated
GRANT UPDATE ON public.orders TO authenticated;

-- 5. Owner-only UPDATE policy
DROP POLICY IF EXISTS "owner_update_orders" ON public.orders;
CREATE POLICY "owner_update_orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_owner())
  WITH CHECK (public.is_owner());
