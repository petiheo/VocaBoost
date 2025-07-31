# Review API Contract

<aside>
🔗

- Base URL: `http://localhost:3000/api/review`
- Authentication Headers (Cho các endpoint cần xác thực):
  `Authorization: Bearer <jwt_token>`

</aside>

# 1. **Get Lists with Due Words**

### Endpoint

```
GET /lists/due
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Retrieved lists with due words.",
  "data": {
    "listsWithDueWords": [
      {
        "id": "list-uuid-A",
        "title": "IELTS Academic Words - Unit 1",
        "wordCount": 50,
        "dueWordCount": 5,
        "tags": ["ielts", "academic"]
      },
      {
        "id": "list-uuid-B",
        "title": "Advanced Business English",
        "wordCount": 95,
        "dueWordCount": 12,
        "tags": ["business", "english"]
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "limit": 10
  }
}
```

# 2. **Get Words Due for Revision**

### Endpoint

```
GET /due
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Retrieved all due words.",
  "data": {
    "dueByList": [
      {
        "listId": "list-uuid-A",
        "listTitle": "IELTS Academic Words - Unit 1",
        "dueWordCount": 5,
        "dueWords": [
          { "id": "word-uuid-1", "term": "Analyze" },
          { "id": "word-uuid-3", "term": "Context" }
        ]
      },
      {
        "listId": "list-uuid-B",
        "listTitle": "Advanced Business English",
        "dueWordCount": 1,
        "dueWords": [{ "id": "word-uuid-15", "term": "Eminent" }]
      }
    ],
    "totalDue": 6
  }
}
```

# 3. **Get Active Session Status**

### Endpoint

```
GET /sessions/status
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Retrieved active session status.",
  "data": {
    "activeSession": {
      "sessionId": "session-uuid-123",
      "sessionType": "flashcard",
      "totalWords": 25,
      "completedWords": 7,
      "remainingWords": [
        {
          "id": "word-uuid-8",
          "term": "Feasible",
          "definition": "Possible to do easily or conveniently.",
          "examples": [
            /* ... */
          ]
        }
        // ... other remaining words
      ]
    }
  }
}
```

# 4. **Start a Revision Session**

### Endpoint

```
POST /sessions/start
```

### **Request Body**

```json
{
  "listId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "sessionType": "flashcard"
}
```

### Response Success (201)

```json
{
  "success": true,
  "message": "Session started successfully.",
  "data": {
    "session": {
      "sessionId": "session-uuid-123",
      "sessionType": "flashcard",
      "totalWords": 25,
      "words": [
        {
          "id": "word-uuid-1",
          "term": "Analyze",
          "definition": "To examine in detail the constitution or structure of something.",
          "phonetics": "/ˈænəlaɪz/",
          "imageUrl": "http://.../image.jpg",
          "examples": [{ "example_sentence": "..." }],
          "synonyms": ["examine", "inspect"]
        }
        // ... 24 other words, shuffled
      ]
    }
  }
}
```

# 5. **Submit a Session Result**

### Endpoint

```
POST /sessions/{sessionId}/submit
```

### **Request Body**

```json
{
  "wordId": "word-uuid-1",
  "result": "correct",
  "responseTimeMs": 2500
}
```

**Field Definitions:**
- `wordId`: Required - The ID of the word being reviewed
- `result`: Required - The result ("correct" or "incorrect")
- `responseTimeMs`: Optional - Response time in milliseconds

### Response Success (200)

```json
{
  "success": true,
  "message": "Result recorded successfully."
}
```

# 6. **End a Revision Session (Get Summary)**

### Endpoint

```
POST /sessions/{sessionId}/end
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Session completed.",
  "data": {
    "summary": {
      "sessionId": "session-uuid-123",
      "totalWords": 25,
      "correctAnswers": 22,
      "incorrectAnswers": 3,
      "accuracy": 88.0,
      "completedAt": "2023-10-22T10:30:00.000Z"
    }
  }
}
```

# Common Error Responses

### Validation Error (400) - **Bad Request**

```json
{
  "success": false,
  "errors": [
    {
      "field": "sessionType",
      "message": "sessionType is required and must be one of [flashcard, fill_blank, word_association]."
    }
  ]
}
```

### **Unauthorized (401)**

```json
{
  "success": false,
  "error": "Unauthorized: Invalid or expired token."
}
```

### **Forbidden (403)**

```json
{
  "success": false,
  "error": "Forbidden: You do not have permission to perform this action."
}
```

### **Not Found (404)**

```json
{
  "success": false,
  "error": "Resource not found."
}
```

### **Conflict (409)**

```json
{
  "success": false,
  "error": "Conflict: This session has already been completed."
}
```

### **Rate Limit Exceeded (429)**

```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

### **Service Unavailable (503)**

```json
{
  "success": false,
  "error": "Service is temporarily unavailable. Please try again in a few minutes."
}
```
