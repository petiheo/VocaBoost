# Classroom API Contract

<aside>
🔗

- Base URL: `http://localhost:3000/api/classroom`
- Authentication Headers (Cho tất cả các endpoint): `Authorization: Bearer <jwt_token>`
</aside>

# 1. Create Classroom (Teacher)

### Endpoint

```
POST /create-classroom
```

### Request Body

```json
{
  "name": "Lớp luyện thi IELTS 8.0",
  "description": "Lớp học luyện thi IELTS dành cho học viên khá giỏi",
  "classroom_status": "private",
  "capacity_limit": 50
}
```

### Validation Rules

- **name**: Required, string
- **description**: Optional, max 1000 chars
- **classroom_status**: Required, enum ("private" or "public")
- **capacity_limit**: Required, integer 1-100, default 50

| Field              | Type                         | Required | Notes                 |
| ------------------ | ---------------------------- | -------- | --------------------- |
| `name`             | string                       | ✅       |                       |
| `description`      | string                       | ❌       | max 1000 chars        |
| `classroom_status` | enum (`private` \| `public`) | ✅       |                       |
| `capacity_limit`   | integer                      | ✅       | 1 - 100, default = 50 |

### Response Success (201)

```json
{
  "success": true,
  "message": "Classroom created successfully",
  "data": {
    "id": "0fa21d69-8d6b-4622-8b34-b2f64fffc0f5",
    "teacher_id": "5d989deb-f811-479e-beb3-75e8d43db64c",
    "name": "Lớp luyện thi IELTS 8.0",
    "description": "Lớp học luyện thi IELTS dành cho học viên khá giỏi",
    "join_code": "H262KE",
    "learnercount": 0,
    "assignmentcount": 0,
    "classroom_status": "private",
    "is_auto_approval_enabled": false,
    "capacity_limit": 50,
    "created_at": "2025-07-09T09:17:58.658838+00:00",
    "updated_at": "2025-07-09T09:17:58.658838+00:00"
  }
}
```

### Response Error

### 🚫 Forbidden (Not teacher: 403)

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### ❗ Validation Error (400)

```json
{
  "success": false,
  "errors": [
    {
      "field": "capacity_limit",
      "message": "capacity_limit must be an integer between 1 and 999"
    }
  ]
}
```

# 2. Get All Classrooms by Teacher (Teacher)

### Endpoint

```
GET /my-classrooms
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "82d73181-f9b7-41f8-9bf1-0eaef441522a",
      "teacher_id": "5d989deb-f811-479e-beb3-75e8d43db64c",
      "name": "Lớp luyện thi IELTS 8.0",
      "description": "Lớp học luyện thi IELTS dành cho học viên trình độ khá - giỏi.",
      "join_code": "BH54G9",
      "learner_count": 0,
      "assignment_count": 0,
      "classroom_status": "private",
      "is_auto_approval_enabled": false,
      "capacity_limit": 50,
      "created_at": "2025-07-07T16:18:06.25457+00:00",
      "updated_at": "2025-07-07T16:18:06.25457+00:00"
    },
    {
      "id": "0fa21d69-8d6b-4622-8b34-b2f64fffc0f5",
      "teacher_id": "5d989deb-f811-479e-beb3-75e8d43db64c",
      "name": "Lớp luyện thi IELTS 5.0",
      "description": "Lớp học luyện thi IELTS dành cho học viên trình độ trung bình",
      "join_code": "H262KE",
      "learnercount": 0,
      "assignmentcount": 0,
      "classroom_status": "public",
      "is_auto_approval_enabled": false,
      "capacity_limit": 60,
      "created_at": "2025-07-09T09:17:58.658838+00:00",
      "updated_at": "2025-07-09T09:17:58.658838+00:00"
    }
  ]
}
```

### Response Error

### 🚫 Forbidden (Not teacher: 403)

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

# 3. Request to Join a Classroom (Learner)

### Endpoint

```
POST /join-request
```

### Request Body

```json
{
  "joinCode": "ABC123"
}
```

### Success Response

```json
// Auto-Approval enabled
{
  "success": true,
  "message": "You have joined the classroom."
}

// Manual approval eequired
{
  "success": true,
  "message": "Join request submitted. Please wait for approval."
}
```

### Error Response

```json
// Classroom not found / deleted
{
	"success": false,
	"message": "Classroom not found or has been deleted."
}

// Classroom is private
{
	"success": false,
	"message": "This classroom is private. You must be invited by the teacher."
}

// User is the classroom owner
{
	"success": false,
	"message": "You are the owner of this classroom."
}

// Already requested to join
{
	"success": false,
	"message": "You have already requested to join."
}

// Already a member
{
	"success": false,
	"message": "You are already a member of this classroom."
}

// Class is full
{
	"success": false,
	"message": "This classroom has reached its capacity limit."
}
```

# 4. Get Learner’s Join Requests (Teacher)

### Endpoint

```
GET /:classroomId/join-requests
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "data": [
    {
      "learner_id": "4d876ced-9e9a-4fa1-8b6d-4269291350a6",
      "email": "hoan@gmail.com",
      "join_status": "pending_request",
      "joined_at": null,
      "users": {
        "avatar_url": null,
        "display_name": null
      }
    },
    {
      "learner_id": "8c74a0ad-0e75-4f4a-a507-00146ce31299",
      "email": "bin@gmail.com",
      "join_status": "pending_request",
      "joined_at": null,
      "users": {
        "avatar_url": null,
        "display_name": null
      }
    }
  ]
}
```

### Error Response

```json
// 403	Not the teacher of the class
{
	"success": false,
	"message": "You do not have access to this classroom."
}
// 404	Classroom not found or deleted
{
	"success": false,
	"message": "Classroom not found or has been deleted."
}
```

# 5. Approve Join Request (Teacher)

### Endpoint

```
POST /:classroomId/approve-request
```

### Request Body

```json
{
  "learnerId": "4d876ced-9e9a-4fa1-8b6d-4269291350a6"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Join request approved."
}
```

### Response Error

```json
// 400	Learner not found in classroom
{
	"success": false,
	"message": "Learner is not part of this classroom."
}

// 400	Learner not in pending state
{
	"success": false,
	"message": "Learner is not in pending request state."
}

// 403	Not the teacher of this class
{
	"success": false,
	"message": "Insufficient classroom permissions."
}

// 404	Classroom not found/deleted
{
	"success": false,
	"message": "Classroom not found or has been deleted."
}

// 400	Class is full
{
	"success": false,
	"message": "Classroom is full. Cannot approve more learners."
}
```

# 6. Reject Join Request (Teacher)

### Endpoint

```
POST /:classroomId/reject-request
```

### Request Body

```json
{
  "learnerId": "4d876ced-9e9a-4fa1-8b6d-4269291350a6"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Join request rejected."
}
```

### Response Error

```json
// 400	Learner not found in classroom
{
	"success": false,
	"message": "Learner is not part of this classroom."
}

// 400	Learner not in pending state
{
	"success": false,
	"message": "Learner is not in pending request state."
}

// 403	Not the teacher of this class
{
	"success": false,
	"message": "Insufficient classroom permissions."
}

// 404	Classroom not found/deleted
{
	"success": false,
	"message": "Classroom not found or has been deleted."
}
```

# 7. Approve All Join Requests (Teacher)

### Endpoint

```
POST /:classroomId/approve-all
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "message": "Approved 2 learners."
}
```

### Response Error

```json
// 403	Not the teacher of the class
{
	"success": false,
	"message": "You do not have access to this classroom."
}
// 404	Classroom not found or deleted
{
	"success": false,
	"message": "Classroom not found or has been deleted."
}
```

# 8. Get Learners in Classroom (Teacher)

### Endpoint

```
GET /:classroomId/learners
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "data": [
    {
      "learner_id": "uuid-string",
      "email": "student@example.com",
      "joined_at": "2025-07-09T12:34:56.000Z",
      "users": {
        "display_name": "Student A",
        "avatar_url": "https://cdn.example.com/avatar.png"
      }
    },
    ...
  ]
}
```

### Response Error

```json
// 403	Not the teacher of the class
{
	"success": false,
	"message": "You do not have access to this classroom."
}
// 404	Classroom not found or deleted
{
	"success": false,
	"message": "Classroom not found or has been deleted."
}
```

# 9. Remove a Learner (Teacher)

### Endpoint

```
POST /:classroomId/remove-learner
```

### Request Body

```json
{
  "learnerId": "4d876ced-9e9a-4fa1-8b6d-4269291350a6"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Learner has been removed from the classroom."
}
```

### Response Error

```json
// 400	Learner not found in classroom
{
	"success": false,
	"message": "Learner not found in this classroom."
}

// 400	Learner is not currently joined
{
	"success": false,
	"message": "Cannot remove learner who is not currently in the class."
}

// 404	Classroom not found or deleted
{
	"success": false,
	"message": "Classroom not found or has been deleted."
}
```

# 10. Delete a Classroom (Teacher)

### Endpoint

```
DELETE /:classroomId
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "message": "Classroom has been deleted."
}
```

### Response Error

```json
// 404	Classroom not found or deleted
{
  "success": false,
  "message": "Classroom not found or has been deleted."
}
```

# 11. Search Learners by Display Name (All)

### Endpoint

```
GET /:classroomId/search-learners
```

### Request Body

```json

```

### Query Parameters

| Parameter | Type   | Required | Description                                                                                    |
| --------- | ------ | -------- | ---------------------------------------------------------------------------------------------- |
| `status`  | string | ✅ Yes   | Learner join status to filter by. Options: `joined`, `pending_request`, `pending_invite`, etc. |
| `q`       | string | ❌ No    | Optional keyword to search in `users.display_name`                                             |

Example: `/search-learners?status=joined&q=nghi`

### Response Success (200)

```json
{
  "success": true,
  "data": [
    {
      "learner_id": "8c74a0ad-0e75-4f4a-a507-00146ce31299",
      "email": "bin@gmail.com",
      "join_status": "joined",
      "users": {
        "avatar_url": null,
        "display_name": "Nghị"
      }
    }
  ]
}
```

### Response Error

```json
// 400	Missing status
{
	"success": false,
	"message": "Missing required parameter: status"
}

// 404	Classroom not found or deleted
{
	"success": false,
	"message": "Classroom not found or has been deleted."
}
```

# 12. Invite Learner (Teacher)

### Endpoint

```
POST /:classroomId/invitation
```

### Request Body

```json
{
  "email": "student@example.com"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Invitation has been sent."
}
```

### Response Error

```json
// 400	Missing email
{
  "success": false,
  "message": "Missing email of learner."
}

// 400	Invite yourself
{
  "success": false,
  "message": "You cannot invite yourself to your own classroom."
}

// 400	Already member
{
  "success": false,
  "message": "This learner is already a member of the classroom."
}

// 404	Classroom not found or deleted
{
  "success": false,
  "message": "Classroom not found or has been deleted."
}
```

# 13. Accept Invitation (Learner)

### Endpoint

```
POST /accept-invitation
```

### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "You have successfully joined the classroom.",
  "data": {
    "classroomId": "uuid-of-class"
  }
}
```

### Response Error

```json
// 400	Missing token
{
  "success": false,
  "message": "Missing invitation token."
}

// 400	Invalid or expired token
{
  "success": false,
  "message": "Invalid or expired invitation token."
}

// 400	Invitation cancelled
{
  "success": false,
  "message": "This invitation has been cancelled."
}

// 400	Already joined
{
  "success": false,
  "message": "You are already a member of this classroom."
}

// 400	Token does not belong to this account
{
  "success": false,
  "message": "This invitation was not sent to your account."
}

// 404	Classroom not found or deleted
{
  "success": false,
  "message": "Classroom not found or has been deleted."
}
```

# 14. Cancel Invitation (Teacher)

### Endpoint

```
DELETE /:classroomId/invitation
```

### Request Body

```json
{
  "email": "student@example.com"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Invitation has been cancelled."
}
```

### Response Error

```json
// 400	Missing email
{
  "success": false,
  "message": "Missing email in request body."
}

// 400	Invitation already accepted
{
  "success": false,
  "message": "This invitation has already been accepted and cannot be cancelled."
}

// 404	Invitation not found
{
  "success": false,
  "message": "Invitation not found."
}

// 404	Classroom not found or deleted
{
  "success": false,
  "message": "Classroom not found or has been deleted."
}
```

# 15. Create Assignment (Teacher)

### Endpoint

```
POST /:classroomId/assignment
```

### Request Body

```json
{
  "vocabListId": "3ecb287e-453a-4c97-a590-e85742d0b9d2",
  "title": "Unit 1: Business Basics",
  "exerciseMethod": "flashcard",
  "wordsPerReview": 5,
  "startDate": "2025-07-15T10:00:00Z",
  "dueDate": "2025-07-20T10:00:00Z"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Assignment created successfully.",
  "data": {
    "id": "084c74f5-4e34-444e-b0ea-5d7e16707aae",
    "classroom_id": "0942ed47-0982-4916-b7bd-ad5735bd60a3",
    "vocab_list_id": "3ecb287e-453a-4c97-a590-e85742d0b9d2",
    "teacher_id": "16ba97c6-15f3-4515-88af-fd74285d47ae",
    "title": "Unit 1: Business Basics",
    "exercise_method": "flashcard",
    "words_per_review": 5,
    "sublist_count": 2,
    "start_date": "2025-07-15T10:00:00+00:00",
    "due_date": "2025-07-20T10:00:00+00:00",
    "created_at": "2025-07-17T15:58:59.63604+00:00",
    "updated_at": "2025-07-17T15:58:59.63604+00:00"
  }
}
```

### Response Error

```json
// 400	List not found or empty.
{
  "success": false,
  "message": "Vocabulary list not found or empty."
}

// 400 Invalid wordsPerReview
{
  "success": false,
  "message": "wordsPerReview must be between 5 and 30."
}

// 404	Classroom not found or deleted
{
  "success": false,
  "message": "Classroom not found or has been deleted."
}
```

# 16. Get All Classroom by Learner (Learner)

### Endpoint

```
GET /my-joined
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "0942ed47-0982-4916-b7bd-ad5735bd60a3",
      "teacher_id": "16ba97c6-15f3-4515-88af-fd74285d47ae",
      "name": "TOEIC Test",
      "description": "Class for TOEIC practice",
      "join_code": "ABC123",
      "learner_count": 1,
      "status": "public",
      "assignment_count": 2
    }
  ]
}
```

### Response Error

```json

```

# 17. Get Invitations (Teacher)

### Endpoint

```
GET /:classroomId/invitations
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "data": [
    {
      "email": "nghi1@gmail.com"
    },
    {
      "email": "nghi2@gmail.com"
    }
  ]
}
```

### Response Error

```json

```

# 18. Get Assignments by Teacher (Teacher)

### Endpoint

```
GET /:classroomId/assignments
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "4a6301e5-5a39-4cdb-9c9e-20ddc0b703a6",
      "title": "Unit 2: Airport",
      "exercise_method": "flashcard",
      "start_date": "2025-07-20T10:00:00+00:00",
      "due_date": "2025-07-25T10:00:00+00:00",
      "words_per_review": 5,
      "sublist_count": 2,
      "created_at": "2025-07-18T02:38:22.897267+00:00",
      "updated_at": "2025-07-18T02:38:22.897267+00:00",
      "status": "pending"
    },
    {
      "id": "084c74f5-4e34-444e-b0ea-5d7e16707aae",
      "title": "Unit 1: Business Basics",
      "exercise_method": "flashcard",
      "start_date": "2025-07-15T10:00:00+00:00",
      "due_date": "2025-07-20T10:00:00+00:00",
      "words_per_review": 6,
      "sublist_count": 2,
      "created_at": "2025-07-17T15:58:59.63604+00:00",
      "updated_at": "2025-07-17T15:58:59.63604+00:00",
      "status": "assigned"
    }
  ]
}
```

### Response Error

```json

```

# 19. Get To review Assignments (Learner)

### Endpoint

```
GET /:classroomId/assignments/to-review
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "data": [
    {
      "assignment_id": "084c74f5-4e34-444e-b0ea-5d7e16707aae",
      "title": "Unit 1: Business Basics",
      "exercise_method": "flashcard",
      "completed_sublist_index": 0,
      "sublist_count": 2,
      "due_date": "2025-07-20T10:00:00+00:00",
      "status": "assigned",
      "learner_status": "not_started"
    },
    {
      "assignment_id": "65bc85e8-9751-447a-aa71-44ae3da30f59",
      "title": "Unit 3: Technology",
      "exercise_method": "flashcard",
      "completed_sublist_index": 0,
      "sublist_count": 2,
      "due_date": "2025-07-25T10:00:00+00:00",
      "status": "assigned",
      "learner_status": "not_started"
    }
  ]
}
```

### Response Error

```json

```

# 20. Get Reviewed Assignments (Learner)

### Endpoint

```
GET /:classroomId/assignments/reviewed
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "data": [
    {
      "assignment_id": "65bc85e8-9751-447a-aa71-44ae3da30f59",
      "title": "Unit 3: Technology",
      "exercise_method": "flashcard",
      "completed_sublist_index": 2,
      "sublist_count": 2,
      "due_date": "2025-07-25T10:00:00+00:00",
      "learner_status": "completed"
    }
  ]
}
```

### Response Error

```json

```

# 21. Get Assignments Details (Teacher)

### Endpoint

```
GET /:classroomId/:assignmentId
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "data": {
    "title": "Unit 3: Technology",
    "start_date": "2025-07-17T10:00:00+00:00",
    "due_date": "2025-07-25T10:00:00+00:00",
    "total_words": 10,
    "reviewed_learner_count": 1,
    "vocabulary": [
      {
          "term": "invoice",
          "definition": "a document asking for payment"
      },
      {
          "term": "shipment",
          "definition": "an amount of goods sent together"
      },
      {
          "term": "customer",
          "definition": "a person who buys goods or services"
      }
      ...
    ]
  }
}
```

### Response Error (400)

```json
{
  "success": false,
  "message": "Assignment not found."
}
```

# 22. Change Auto-approve Setting (Teacher)

### Endpoint

```
PATCH /:classroomId/auto-approve
```

### Request Body

```json
{
  "isAutoApprovalEnabled": true
}
// true to turn on, false to turn off
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Auto-approve setting has been enabled.", // turn off is disabled.
  "data": {
    "classroomId": "0942ed47-0982-4916-b7bd-ad5735bd60a3",
    "isAutoApprovalEnabled": true
  }
}
```

### Response Error (400)

```json
{
  "success": false,
  "message": "isAutoApprovalEnabled must be a boolean."
}
```

# 23. Delete Assignments (Teacher)

### Endpoint

```
DELETE /:classroomId/:assignmentId
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "message": "Assignment deleted successfully."
}
```

### Response Error (400)

```json
{
  "success": false,
  "message": "Assignment not found."
}
```

# 24. Leave Classroom (Learner)

### Endpoint

```
POST /:classroomId/leave
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "message": "You have left the classroom."
}
```

### Response Error (400)

```json

```

# 25. Get Overdue Assignments (Learner)

### Endpoint

```
GET /:classroomId/assignments/overdue
```

### Request Body

```json

```

### Response Success (200)

```json
{
  "success": true,
  "data": [
    {
      "assignment_id": "084c74f5-4e34-444e-b0ea-5d7e16707aae",
      "title": "Unit 1: Business Basics",
      "exercise_method": "flashcard",
      "completed_sublist_index": 0,
      "sublist_count": 2,
      "due_date": "2025-07-20T10:00:00+00:00",
      "status": "overdue",
      "learner_status": "not_started"
    }
  ]
}
```

### Response Error

```json

```

---

# Common Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "errors": [
    {
      "field": "password",
      "message": "Password must contain uppercase, lowercase and number"
    }
  ]
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

### Rate Limit Exceeded (429)

```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

### Classroom Error

```json
// 404 Not found
{
    "success": false,
    "message": "Classroom not found or has been deleted."
}
// 403 Forbidden
{
    "success": false,
    "message": "Insufficient classroom permissions."
}
// 403 Forbidden
{
    "success": false,
    "message": "You do not have access to this classroom."
}
```

# JWT Token Structure

Decoded JWT payload:

```json
{
  "classroomId": "0942ed47-0982-4916-b7bd-ad5735bd60a3",
  "email": "abc@gmail.com",
  "type": "classroom_invitation"
}
```

Token expiry: 7 days (configurable via `JWT_EXPIRE` env variable)
