import { useState } from 'react';
import WalletCard from '@/components/wallet/WalletCard';
import TopUpHistory from '@/components/wallet/TopUpHistory';
import { useAuth } from '@/hooks/useAuth';

export default function WalletSection() {
  const { profile, isLoading, refreshProfile } = useAuth();
  const [historyVersion, setHistoryVersion] = useState(0);

  if (isLoading) return null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-10 sm:px-6">
      <WalletCard
        profile={profile}
        onTopUpSubmitted={() => {
          setHistoryVersion((value) => value + 1);
          void refreshProfile();
        }}
      />
      {profile && <TopUpHistory key={historyVersion} />}
    </div>
  );
}
