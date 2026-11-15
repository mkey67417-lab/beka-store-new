import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { describeAuthError } from '@/lib/authErrors';

interface EmailSignInProps {
  onBack: () => void;
}

export default function EmailSignIn({ onBack }: EmailSignInProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 6) {
      setError('كلمة المرور لازم تكون 6 حروف أو أرقام على الأقل.');
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password, name.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setIsBusy(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-950 p-1">
        {(['signin', 'signup'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setError(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              mode === item ? 'bg-brand-600 text-white' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {item === 'signin' ? 'تسجيل دخول' : 'حساب جديد'}
          </button>
        ))}
      </div>

      {mode === 'signup' && (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-zinc-200">الاسم</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            className={inputClass}
          />
        </label>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-zinc-200">البريد الإلكتروني</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          dir="ltr"
          autoComplete="email"
          required
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-zinc-200">كلمة المرور</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          dir="ltr"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          required
          className={inputClass}
        />
      </label>

      {error && <p role="alert" className="text-center text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isBusy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === 'signup' ? 'اعمل حسابك' : 'ادخل'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-zinc-400 transition-colors hover:text-zinc-100"
      >
        رجوع إلى الخيارات
      </button>
    </form>
  );
}
