# Utils Directory

This directory contains utility functions for consistent error handling and response formatting across the VocaBoost API.

## ResponseUtils

The `ResponseUtils` class provides standardized response methods for all API endpoints.

### Import

```javascript
const { ResponseUtils } = require('../utils');
// or
const ResponseUtils = require('../utils/response');
```

### Methods

#### Success Responses

```javascript
// Basic success response
ResponseUtils.success(res, 'Operation completed successfully');

// Success with data
ResponseUtils.success(res, 'User retrieved successfully', userData);

// Success with custom status code
ResponseUtils.success(res, 'User created successfully', userData, 201);
```

**Output:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* optional data */ }
}
```

#### Error Responses

```javascript
// Basic error response (400 by default)
ResponseUtils.error(res, 'Invalid input provided');

// Error with custom status code
ResponseUtils.error(res, 'Server temporarily unavailable', 503);

// Error with additional details
ResponseUtils.error(res, 'Validation failed', 400, validationErrors);
```

**Output:**
```json
{
  "success": false,
  "message": "Error description",
  "details": { /* optional error details */ }
}
```

#### Specific Error Types

```javascript
// 400 Bad Request
ResponseUtils.error(res, 'Invalid request data');

// 401 Unauthorized
ResponseUtils.unauthorized(res, 'Invalid credentials');

// 403 Forbidden
ResponseUtils.forbidden(res, 'Access denied');

// 404 Not Found
ResponseUtils.notFound(res, 'User not found');

// 409 Conflict
ResponseUtils.conflict(res, 'Email already exists');

// Validation errors
ResponseUtils.validationError(res, 'Validation failed', errorsArray);

// 500 Server Error
ResponseUtils.serverError(res, 'Database connection failed', error);
```

## ErrorHandler

The `ErrorHandler` class provides consistent error handling with logging and context.

### Import

```javascript
const { ErrorHandler } = require('../utils');
// or
const ErrorHandler = require('../utils/errorHandler');
```

### Methods

#### Generic Error Handling

```javascript
// Basic error handling
try {
  // operation
} catch (error) {
  return ErrorHandler.handleError(
    res, 
    error, 
    'getUserProfile', 
    'Failed to get user profile'
  );
}

// With custom status code
ErrorHandler.handleError(res, error, 'deleteUser', 'User deletion failed', 500);
```

#### Specialized Error Handlers

```javascript
// Database errors
ErrorHandler.handleDatabaseError(res, error, 'SELECT', 'User');

// Validation errors
ErrorHandler.handleValidationError(res, error, 'createUser');

// Authentication errors
ErrorHandler.handleAuthError(res, error, 'login');

// Authorization errors
ErrorHandler.handleAuthorizationError(res, error, 'accessAdmin');

// Not found errors
ErrorHandler.handleNotFoundError(res, 'User');

// Duplicate resource errors
ErrorHandler.handleDuplicateError(res, 'Email');
```

#### Async Handler Wrapper

```javascript
// Wrap async route handlers to catch errors automatically
const asyncRoute = ErrorHandler.asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return ResponseUtils.success(res, 'Profile retrieved', user);
});

app.get('/profile', asyncRoute);
```

## Usage Examples

### Controller Pattern

```javascript
const { ResponseUtils, ErrorHandler } = require('../utils');

class UserController {
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profile = await userService.getProfile(userId);
      
      return ResponseUtils.success(res, 'Profile retrieved successfully', profile);
    } catch (error) {
      return ErrorHandler.handleError(
        res,
        error,
        `getProfile - User ${req.user?.userId}`,
        'Failed to get profile'
      );
    }
  }

  async updateProfile(req, res) {
    try {
      const result = await userService.updateProfile(req.user.userId, req.body);
      return ResponseUtils.success(res, 'Profile updated successfully', result);
    } catch (error) {
      if (error.message === 'User not found') {
        return ResponseUtils.notFound(res, error.message);
      }
      return ErrorHandler.handleError(res, error, 'updateProfile', 'Update failed');
    }
  }
}
```

### Service Pattern

```javascript
// In services, throw descriptive errors
class UserService {
  async getProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId, data) {
    if (!data.email) {
      throw new Error('Email is required');
    }
    
    const existingUser = await userModel.findByEmail(data.email);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Email already in use');
    }
    
    return await userModel.update(userId, data);
  }
}
```

## Benefits

1. **Consistent Response Format**: All API responses follow the same structure
2. **Centralized Logging**: All errors are logged with context information
3. **Security**: Production mode hides internal error details
4. **Developer Experience**: Easy to use and maintain
5. **Error Categorization**: Different error types for better client handling
6. **Reduced Boilerplate**: Less repetitive error handling code

## Response Structure

All responses follow this consistent structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "details": { /* optional error details */ }
}
```

This ensures clients can reliably handle all API responses using the same logic.