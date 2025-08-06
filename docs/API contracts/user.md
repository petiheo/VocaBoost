# User Module API Contract

## Overview

The User module provides comprehensive user profile management, learning statistics tracking, and content reporting functionality for VocaBoost.

## API Endpoints

## 1. Get User Profile

```
GET /profile
```

Returns user profile information including settings and counts.

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "e26530eb-5297-4eb7-8130-d34b7e654a25",
    "email": "user@example.com",
    "display_name": "Trần Văn A",
    "avatar_url": null,
    "role": "teacher",
    "created_at": "2025-07-24T14:55:41.792461+00:00",
    "user_settings": {
      "theme": "light",
      "language": "vi",
      "timezone": "Asia/Ho_Chi_Minh",
      "daily_goal": 10,
      "learning_preferences": {
        "session_length": 20,
        "preferred_methods": ["flashcard"]
      },
      "notification_preferences": {
        "push": false,
        "email": true
      }
    },
    "teacherVerification": {
      "status": "pending",
      "submittedAt": "2025-07-24T17:05:56.109212+00:00",
      "institution": "Trường THPT B",
      "rejectionReason": null,
      "message": "Your verification request is being reviewed by our team."
    },
    "classroomCount": 0,
    "vocabularyListCount": 0
  }
}
```

## 2. Update Profile

```
PUT /profile
```

Updates user profile information.

**Request (multipart/form-data):**

- `displayName` (string, optional): New display name
- `avatar` (file, optional): Avatar image file
- `dailyGoal` (int, optional): Daily goal word user want to review
- `removeAvatar` (boolean, optional): Set to true to remove avatar

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "e26530eb-5297-4eb7-8130-d34b7e654a25",
    "email": "user@example.com",
    "display_name": "Trần Văn A",
    "avatar_url": null,
    "role": "teacher",
    "created_at": "2025-07-24T14:55:41.792461+00:00",
    "user_settings": {
      "theme": "light",
      "language": "vi",
      "timezone": "Asia/Ho_Chi_Minh",
      "daily_goal": 11,
      "learning_preferences": {
        "session_length": 20,
        "preferred_methods": ["flashcard"]
      },
      "notification_preferences": {
        "push": false,
        "email": true
      }
    },
    "teacherVerification": {
      "status": "pending",
      "submittedAt": "2025-07-24T17:05:56.109212+00:00",
      "institution": "Trường THPT B",
      "rejectionReason": null,
      "message": "Your verification request is being reviewed by our team."
    },
    "classroomCount": 0,
    "vocabularyListCount": 0
  }
}
```

## 3. Report Content

```
POST /report
```

Reports inappropriate or incorrect vocabulary content.

**Request Body:**

```json
{
  "wordId": "uuid",
  "reason": "This word contains offensive content that is inappropriate for learning."
}
```

### Response Success (201)

```json
{
  "success": true,
  "message": "Content reported successfully. Our team will review it.",
  "data": {
    "reportId": "uuid",
    "status": "open"
  }
}
```

### Response Error (400/404)

```json
{
  "success": false,
  "error": "Word not found."
}
```

```json
{
  "success": false,
  "error": "You have already reported this content."
}
```

## Endpoints Not Yet Implemented

> **Note**: The following endpoints are planned but not yet implemented in the backend.

### 4. Get Learning Statistics

```
GET /profile/statistics
```

_(Planned)_ - Returns learning statistics matching the UI design.

### 5. Delete Account

```
POST /delete-account
```

_(Planned)_ - Soft deletes user account (can be recovered within 30 days).

## Error Responses

All endpoints may return these error responses:

```json
{
  "success": false,
  "message": "Error description",
  "details": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## File Upload Specifications

### Avatar Upload

- **Allowed formats:** JPEG, PNG, GIF, WebP
- **Max file size:** 5MB
- **Storage:** Public bucket

## Settings Constraints

### Daily Goal

- **Min:** 1 word
- **Max:** 1000 words
- **Default:** 10 words

## Rate Limiting

- Report content: 10 requests per 15 minutes

## Notes

1. **Teacher Verification Display:**
   - When `teacherVerification.status === "approved"`, show "Verified" in green
   - Otherwise, show "Not verified" in red
   - Display institution name and school email when verified
2. **Statistics Display:**
   - Progress chart shows cumulative words learned over time
   - Completion rate shows top 5 recent vocabulary lists
   - Study consistency shows active study days in calendar format
3. **Profile Counts:**
   - For teachers: Shows classroom count (e.g., "32 Classrooms")
   - For all users: Shows vocabulary list count (e.g., "10 Vocabulary Lists")
