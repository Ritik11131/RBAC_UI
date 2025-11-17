/**
 * Extract error message from API error response
 * Handles various error formats:
 * - { error: "message" }
 * - { message: "message" }
 * - { error: { message: "message" } }
 * - string errors
 * - HttpErrorResponse
 */
export function extractErrorMessage(error: any): { title: string; message?: string } {
  // Handle null/undefined
  if (!error) {
    return { title: 'An unexpected error occurred' };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return { title: error };
  }

  // Handle HttpErrorResponse (Angular HTTP errors)
  if (error.error) {
    const errorBody = error.error;
    
    // Check for structured error response
    if (typeof errorBody === 'object' && errorBody !== null) {
      // Format: { success: false, error: "message", ... }
      if (errorBody.error && typeof errorBody.error === 'string') {
        // Split error message if it contains colon (for title/message split)
        const errorParts = errorBody.error.split(':');
        if (errorParts.length > 1) {
          return {
            title: errorParts[0].trim(),
            message: errorParts.slice(1).join(':').trim()
          };
        }
        return { title: errorBody.error };
      }
      
      // Format: { message: "message" }
      if (errorBody.message && typeof errorBody.message === 'string') {
        const messageParts = errorBody.message.split(':');
        if (messageParts.length > 1) {
          return {
            title: messageParts[0].trim(),
            message: messageParts.slice(1).join(':').trim()
          };
        }
        return { title: errorBody.message };
      }
    }
    
    // If error.error is a string
    if (typeof errorBody === 'string') {
      const messageParts = errorBody.split(':');
      if (messageParts.length > 1) {
        return {
          title: messageParts[0].trim(),
          message: messageParts.slice(1).join(':').trim()
        };
      }
      return { title: errorBody };
    }
  }

  // Handle error with message property
  if (error.message && typeof error.message === 'string') {
    const messageParts = error.message.split(':');
    if (messageParts.length > 1) {
      return {
        title: messageParts[0].trim(),
        message: messageParts.slice(1).join(':').trim()
      };
    }
    return { title: error.message };
  }

  // Fallback
  return { title: 'An unexpected error occurred' };
}

