// Generic error handler to prevent information leakage
// Maps internal errors to user-friendly messages without exposing system details

export const getGenericErrorMessage = (error: unknown, context: 'auth' | 'save' | 'load' | 'delete' | 'duplicate'): string => {
  // Log the actual error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error(`[${context}] Error:`, error);
  }

  // Check for specific Supabase auth errors
  if (context === 'auth' && error && typeof error === 'object') {
    const authError = error as { code?: string; message?: string };
    if (authError.code === 'invalid_credentials') {
      return 'Anmeldung fehlgeschlagen. Bitte überprüfe E-Mail und Passwort. Falls du dich gerade registriert hast, bestätige bitte zuerst deine E-Mail-Adresse.';
    }
    if (authError.code === 'email_not_confirmed') {
      return 'Bitte bestätige zuerst deine E-Mail-Adresse. Prüfe dein Postfach (auch den Spam-Ordner).';
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
