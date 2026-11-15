export interface Game {
  id: string;
  name_ar: string;
  name_en: string;
  accent_color: string;
  sort_order: number;
}

export interface Package {
  id: string;
  game_id: string;
  label_ar: string;
  price_sdg: number;
  sort_order: number;
}

export interface PaymentMethod {
  id: string;
  name_ar: string;
  account_label_ar: string;
  account_value: string;
  instructions_ar: string | null;
  sort_order: number;
  is_active: boolean;
}

export type TopUpMethodId = 'fawry' | 'mycashi';

export type TopUpStatus = 'pending' | 'approved' | 'rejected';

export type UserRole = 'customer' | 'owner';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  balance: number;
  points: number;
}

export interface TopUpRequest {
  id: string;
  userId: string;
  amount: number;
  method: TopUpMethodId;
  transactionNumber: string;
  receiptPath: string;
  status: TopUpStatus;
  createdAt: string;
}

export interface Catalog {
  games: Game[];
  packages: Package[];
  paymentMethods: PaymentMethod[];
}
