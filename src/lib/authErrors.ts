const MESSAGES: Record<string, string> = {
  invalid_credentials: 'البيانات دي مش صحيحة، تأكد من الإيميل وكلمة المرور.',
  otp_expired: 'الكود انتهت صلاحيته، اطلب كود جديد.',
  otp_disabled: 'الكود ما اتبعت، اطلب كود جديد بعد شوية.',
  over_sms_send_rate_limit: 'بعتنا كود كتير في وقت قصير، استنى شوية وجرّب تاني.',
  over_request_rate_limit: 'طلبات كتيرة في وقت قصير، استنى شوية وجرّب تاني.',
  phone_provider_disabled: 'تسجيل الدخول برقم الهاتف غير متاح الآن، جرّب قوقل.',
  validation_failed: 'الرقم ما صحيح، اكتبه بالشكل ده: 0912345678.',
  provider_disabled: 'تسجيل الدخول بقوقل غير متاح الآن، جرّب برقم الهاتف.',
};

const NETWORK_MESSAGE = 'الإنترنت ضعيف أو مقطوع، اتأكد من الشبكة وجرّب تاني.';
const GENERIC_MESSAGE = 'حصلت مشكلة في الدخول، جرّب تاني بعد شوية.';

export function describeAuthError(error: unknown): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return NETWORK_MESSAGE;
  const code = (error as { code?: unknown })?.code;
  if (typeof code === 'string' && MESSAGES[code]) return MESSAGES[code];
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('invalid otp') || message.includes('token has expired')) {
    return 'الكود غلط أو انتهت صلاحيته، جرّب تاني.';
  }
  if (message.includes('failed to fetch') || message.includes('network')) return NETWORK_MESSAGE;
  return GENERIC_MESSAGE;
}
