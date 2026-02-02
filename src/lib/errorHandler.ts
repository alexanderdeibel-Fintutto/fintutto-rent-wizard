// Generic error handler to prevent information leakage
// Maps internal errors to user-friendly messages without exposing system details

export const getGenericErrorMessage = (error: unknown, context: 'auth' | 'save' | 'load' | 'delete' | 'duplicate'): string => {
  // Log the actual error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error(`[${context}] Error:`, error);
  }

  // Return context-appropriate generic messages
  switch (context) {
    case 'auth':
      return 'Bei der Anmeldung ist ein Fehler aufgetreten. Bitte überprüfe deine Eingaben und versuche es erneut.';
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
