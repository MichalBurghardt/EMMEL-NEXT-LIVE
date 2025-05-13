/**
 * Custom error response class to standardize API error handling
 */
class ErrorResponse extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
  
  // Static helper methods to create common error types
  
  static badRequest(message = 'Ungültige Anfrage'): ErrorResponse {
    return new ErrorResponse(message, 400);
  }
  
  static unauthorized(message = 'Nicht autorisiert. Bitte melden Sie sich an.'): ErrorResponse {
    return new ErrorResponse(message, 401);
  }
  
  static forbidden(message = 'Zugriff verweigert. Keine Berechtigung für diese Aktion.'): ErrorResponse {
    return new ErrorResponse(message, 403);
  }
  
  static notFound(message = 'Ressource nicht gefunden'): ErrorResponse {
    return new ErrorResponse(message, 404);
  }
  
  static conflict(message = 'Ressource existiert bereits'): ErrorResponse {
    return new ErrorResponse(message, 409);
  }
  
  static validation(message = 'Validierungsfehler'): ErrorResponse {
    return new ErrorResponse(message, 422);
  }
  
  static server(message = 'Interner Serverfehler'): ErrorResponse {
    return new ErrorResponse(message, 500);
  }
}

export default ErrorResponse;