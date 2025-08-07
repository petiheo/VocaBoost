# Utils Directory

This directory contains utility functions and helpers for the VocaBoost backend API. All utilities are exported through the main `index.js` file for easy importing.

## Available Utilities

- **ResponseUtils**: Standardized API response formatting
- **ErrorHandler**: Consistent error handling with logging
- **PaginationUtil**: Database pagination helpers
- **logger**: Winston-based logging system
- **common**: Common utility functions (array shuffling, etc.)
- **dbPoolMonitor**: Database connection pool monitoring
- **htmlUtils**: HTML entity decoding for vocabulary data
- **tokenCleanup**: JWT token blacklist cleanup utilities

## Usage

```javascript
// Import all utilities
const {
  ResponseUtils,
  ErrorHandler,
  PaginationUtil,
  logger,
  common,
  dbPoolMonitor,
  htmlUtils,
  tokenCleanup,
} = require('../utils');

// Or import individual modules
const ResponseUtils = require('../utils/response');
const logger = require('../utils/logger');
```

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
  "data": {
    /* optional data */
  }
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
  "details": {
    /* optional error details */
  }
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
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "details": {
    /* optional error details */
  }
}
```

This ensures clients can reliably handle all API responses using the same logic.

## Logger

Winston-based logging system with file and console output.

### Import

```javascript
const { logger } = require('../utils');
// or
const logger = require('../utils/logger');
```

### Usage

```javascript
// Basic logging levels
logger.info('Application started');
logger.error('Database connection failed', error);
logger.warn('Rate limit exceeded');
logger.debug('Processing user request');

// HTTP request logging
logger.http(req, res, duration);
```

### Features

- **Console output**: Colored logs for development
- **File logging**: Error and combined logs (non-production only)
- **HTTP logging**: Custom method for request/response logging
- **Timestamp formatting**: Consistent timestamp format
- **Environment-aware**: Different behavior in production vs development

## PaginationUtil

Utility class for handling database pagination with Supabase.

### Import

```javascript
const { PaginationUtil } = require('../utils');
// or
const PaginationUtil = require('../utils/pagination');
```

### Methods

#### Validate Pagination Parameters

```javascript
const pagination = PaginationUtil.validate(page, limit, maxLimit);
// Returns: { page: 1, limit: 10, offset: 0 }
```

#### Build Response with Pagination Metadata

```javascript
const response = PaginationUtil.buildResponse(data, pagination, totalCount);
// Returns paginated response with metadata
```

#### Execute Paginated Query

```javascript
const result = await PaginationUtil.execute(query, pagination, countQuery);
// Executes Supabase query with pagination and returns formatted response
```

#### Build Supabase Query with Pagination

```javascript
const paginatedQuery = PaginationUtil.buildSupabaseQuery(baseQuery, pagination);
// Applies range() and select() with count to Supabase query
```

## Common Utilities

Collection of common utility functions.

### Import

```javascript
const { common } = require('../utils');
// or
const common = require('../utils/common');
```

### Methods

```javascript
// Shuffle array elements (Fisher-Yates algorithm)
const shuffled = common.shuffleArray([1, 2, 3, 4, 5]);
```

## Database Pool Monitor

Utilities for monitoring and testing database connection pool performance.

### Import

```javascript
const { dbPoolMonitor } = require('../utils');
// or
const dbPoolMonitor = require('../utils/dbPoolMonitor');
```

### Methods

```javascript
// Test single connection
const result = await dbPoolMonitor.testConnection(supabaseClient);

// Test concurrent connections
const results = await dbPoolMonitor.testConcurrentConnections(supabaseClient, 5);

// Get pool configuration
const config = dbPoolMonitor.getPoolConfiguration();

// Get test statistics
const stats = dbPoolMonitor.getTestStatistics(10); // Last 10 tests

// Log current pool status
dbPoolMonitor.logPoolStatus();
```

### Features

- **Connection testing**: Test database connectivity and response times
- **Concurrent testing**: Test multiple connections simultaneously
- **Performance monitoring**: Track response times and success rates
- **Configuration analysis**: Analyze pool settings and connection types
- **Statistics tracking**: Historical test data and performance metrics

## HTML Utils

Utilities for handling HTML entity decoding in vocabulary data.

### Import

```javascript
const { htmlUtils } = require('../utils');
// or
const htmlUtils = require('../utils/htmlUtils');
```

### Methods

```javascript
// Decode HTML entities in a single vocabulary word
const decodedWord = htmlUtils.decodeVocabularyData(vocabularyWord);

// Decode HTML entities in an array of vocabulary words
const decodedWords = htmlUtils.decodeVocabularyList(vocabularyWords);
```

### Features

- **HTML entity decoding**: Converts HTML entities to readable text
- **Vocabulary-specific**: Handles term, definition, translation, examples, and synonyms
- **Safe processing**: Handles null/undefined values gracefully
- **Array support**: Process multiple vocabulary items at once

## Token Cleanup

Utilities for managing JWT token blacklist cleanup.

### Import

```javascript
const { tokenCleanup } = require('../utils');
// or
const tokenCleanup = require('../utils/tokenCleanup');
```

### Methods

```javascript
// Clean up expired tokens
const deletedCount = await tokenCleanup.cleanupExpiredTokens();

// Schedule automatic cleanup (runs every 24 hours by default)
tokenCleanup.scheduleCleanup(24); // hours
```

### Features

- **Expired token removal**: Automatically removes expired blacklisted tokens
- **Statistics tracking**: Logs cleanup results and blacklist statistics
- **Scheduled cleanup**: Set up automatic periodic cleanup
- **Error handling**: Proper error logging and handling
- **Monitoring**: Provides insights into token blacklist health

## Best Practices

### Consistent Error Handling

```javascript
const { ErrorHandler, ResponseUtils } = require('../utils');

// In controllers
try {
  const result = await service.operation();
  return ResponseUtils.success(res, 'Operation successful', result);
} catch (error) {
  return ErrorHandler.handleError(res, error, 'operationContext');
}

// Use async handler wrapper
const asyncRoute = ErrorHandler.asyncHandler(async (req, res) => {
  // Route logic here - errors automatically caught
});
```

### Logging Best Practices

```javascript
const { logger } = require('../utils');

// Include context in logs
logger.info(`User ${userId} performed action: ${action}`);
logger.error('Database error in getUserProfile:', error);

// Use appropriate log levels
logger.debug('Detailed debug info'); // Development only
logger.info('General information'); // Important events
logger.warn('Warning condition'); // Potential issues
logger.error('Error occurred'); // Actual errors
```

### Pagination Implementation

```javascript
const { PaginationUtil, ResponseUtils } = require('../utils');

async function getUsers(req, res) {
  const { page, limit } = req.query;
  const pagination = PaginationUtil.validate(page, limit);

  const query = supabase.from('users').select('*');
  const result = await PaginationUtil.execute(query, pagination);

  return ResponseUtils.paginated(
    res,
    'Users retrieved',
    result.data,
    result.pagination
  );
}
```

This comprehensive utility system ensures consistency, maintainability, and proper error handling across the entire VocaBoost backend API.
