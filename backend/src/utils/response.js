const logger = require('./logger');

class ResponseUtils {
  static success(res, message, data = null, statusCode = 200) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  static error(res, message, statusCode = 400, details = null) {
    const response = {
      success: false,
      message,
    };

    if (details !== null) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  static validationError(res, message = 'Validation failed', errors = []) {
    return res.status(400).json({
      success: false,
      message,
      details: errors,
    });
  }

  static serverError(res, message = 'Internal server error', error = null) {
    if (error) {
      logger.error('Server error:', error);
    }

    return res.status(500).json({
      success: false,
      message,
    });
  }

  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message,
    });
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      message,
    });
  }

  static forbidden(res, message = 'Access forbidden') {
    return res.status(403).json({
      success: false,
      message,
    });
  }

  static conflict(res, message = 'Resource conflict') {
    return res.status(409).json({
      success: false,
      message,
    });
  }

  static badRequest(res, message = 'Bad request') {
    return res.status(400).json({
      success: false,
      message,
    });
  }

  static paginated(res, message, data, pagination, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

module.exports = ResponseUtils;
