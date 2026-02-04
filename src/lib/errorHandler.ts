// Generic error handler to prevent information leakage
// Maps internal errors to user-friendly messages without exposing system details

export const getGenericErrorMessage = (error: unknown, context: 'auth' | 'save' | 'load' | 'delete' | 'duplicate'): string => {
  // Log the actual error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error(`[${context}] Error:`, error);
  }

  // Check for specific Supabase auth errors
  if (context === 'auth' && error && typeof error === 'object') {
    const authError = error as { code?: string; message?: string; status?: number; __isAuthError?: boolean };
    const errorMessage = authError.message?.toLowerCase() || '';
    
    // Timeout errors - check multiple indicators
    if (
      authError.code === 'request_timeout' || 
      authError.status === 504 || 
      errorMessage.includes('timeout') ||
      errorMessage.includes('timed out') ||
      errorMessage.includes('deadline exceeded')
    ) {
      return 'Die Anfrage hat zu lange gedauert. Der Account wurde möglicherweise trotzdem erstellt. Bitte prüfe dein E-Mail-Postfach oder versuche dich anzumelden.';
    }
    
    // Invalid credentials - user might not have confirmed email yet
    if (authError.code === 'invalid_credentials' || errorMessage.includes('invalid login credentials')) {
      return 'Anmeldung fehlgeschlagen. Bitte überprüfe E-Mail und Passwort. Falls du dich gerade registriert hast, bestätige bitte zuerst deine E-Mail-Adresse.';
    }
    
    // Email not confirmed
    if (authError.code === 'email_not_confirmed' || errorMessage.includes('email not confirmed')) {
      return 'Bitte bestätige zuerst deine E-Mail-Adresse. Prüfe dein Postfach (auch den Spam-Ordner).';
    }
    
    // User already exists
    if (authError.code === 'user_already_exists' || errorMessage.includes('already registered') || errorMessage.includes('user already registered')) {
      return 'Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an oder nutze "Passwort vergessen".';
    }
    
    // Weak password
    if (authError.code === 'weak_password' || errorMessage.includes('password')) {
      return 'Das Passwort ist zu schwach. Bitte wähle ein stärkeres Passwort (mind. 6 Zeichen).';
    }
    
    // Invalid email format
    if (errorMessage.includes('invalid email') || errorMessage.includes('valid email')) {
      return 'Bitte gib eine gültige E-Mail-Adresse ein.';
    }
  }

  // Return context-appropriate generic messages
  switch (context) {
    case 'auth':
      return 'Bei der Anmeldung ist ein Fehler aufgetreten. Bitte versuche es später erneut.';
    case 'save':
      return 'Die Berechnung konnte nicht gespeichert werden. Bitte versuche es später erneut.';
    case 'load':
      return 'Die Berechnungen konnten nicht geladen werden. Bitte versuche es später erneut.';
    case 'delete':
      return 'Die Berechnung konnte nicht gelöscht werden. Bitte versuche es später erneut.';
    case 'duplicate':
      return 'Die Berechnung konnte nicht dupliziert werden. Bitte versuche es später erneut.';
    default:
      return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.';
  }
};

// Validation constants
export const CALCULATION_NAME_MAX_LENGTH = 100;
export const CALCULATION_NAME_MIN_LENGTH = 1;

// Validate calculation name
export const validateCalculationName = (name: string): { isValid: boolean; error?: string } => {
  const trimmedName = name.trim();
  
  if (trimmedName.length < CALCULATION_NAME_MIN_LENGTH) {
    return { isValid: false, error: 'Bitte gib einen Namen für die Berechnung ein.' };
  }
  
  if (trimmedName.length > CALCULATION_NAME_MAX_LENGTH) {
    return { isValid: false, error: `Der Name darf maximal ${CALCULATION_NAME_MAX_LENGTH} Zeichen lang sein.` };
  }
  
  return { isValid: true };
};
