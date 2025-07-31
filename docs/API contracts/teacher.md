# Teacher Verification API Contract

## Overview

The teacher verification system allows users to submit credentials for verification to upgrade their account from "learner" to "teacher" role. This gives them access to classroom management features.

## Prerequisites

- User must be authenticated (valid JWT token)
- User must have verified email address
- Install multer dependency: `npm install multer`

<aside>
🔗

- Base URL: `http://localhost:3000/api/teacher`
- Authentication Headers (Cho các endpoint cần xác thực):
  `Authorization: Bearer <jwt_token>`

</aside>

## API Endpoints

## 1. Submit Teacher Verification Request

Submit credentials for teacher account verification.

**Endpoint:** `POST /verification/submit`

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**

- `fullName` (required): Teacher's full name
- `institution` (required): School/Institution name
- `schoolEmail` (required): School email address
- `additionalNotes` (optional): Additional information
- `credentials` (optional): Supporting document file (image/PDF/DOC)

**File Requirements:**

- Max size: 10MB
- Allowed types: JPEG, PNG, PDF, DOC, DOCX
- Field name must be: `credentials`

**Success Response (201):**

```json
{
  "success": true,
  "message": "Your teacher verification request has been submitted successfully.",
  "data": {
    "requestId": "uuid",
    "status": "pending",
    "submittedAt": "2025-07-20T10:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Submit verification failed, please check your existing request status."
}
```

**Other Error Responses:**

- 401: Unauthorized
- 403: Email not verified

## 2. Get Verification Status

Check the status of your teacher verification request.

**Endpoint:** `GET /verification/status`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "",
  "data": {
    "status": "pending|approved|rejected|not_submitted",
    "submittedAt": "2025-07-20T10:00:00Z",
    "institution": "University Name",
    "rejectionReason": "Reason if rejected",
    "message": "Status message"
  }
}
```

## Admin Endpoints (Not Yet Implemented)

> **Note**: The following admin endpoints are planned but not yet implemented in the backend.

### Get Pending Requests (Admin Only)

**Endpoint:** `GET /verification/requests/pending` _(Planned)_

### Approve Request (Admin Only)

**Endpoint:** `PUT /verification/requests/:requestId/approve` _(Planned)_

### Reject Request (Admin Only)

**Endpoint:** `PUT /verification/requests/:requestId/reject` _(Planned)_

---

## Supabase Storage Setup

### 1. Create Storage Bucket

The storage service will automatically create a bucket named `teacher-credentials` with:

- Private access (no public URLs)
- 10MB file size limit
- Restricted mime types

### 2. RLS Policies (Optional)

If you want to add Row Level Security policies:

```sql
-- Allow users to upload their own files
CREATE POLICY "Users can upload own credentials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'teacher-credentials' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own files
CREATE POLICY "Users can view own credentials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'teacher-credentials' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow admins to view all files
CREATE POLICY "Admins can view all credentials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'teacher-credentials' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Email Notifications

The system automatically sends email notifications:

1. **To Admins**: When a new verification request is submitted
2. **To Teachers**:
   - When request is approved (with teacher dashboard access)
   - When request is rejected (with reason and resubmission instructions)

## Security Considerations

1. Files are stored in a private bucket with signed URLs
2. Only authenticated users with verified emails can submit requests
3. File uploads are validated for type and size
4. Admin role required for approval/rejection endpoints
5. Users can only check their own verification status

## Error Handling

- Duplicate pending requests are prevented
- File upload errors are handled gracefully
- Invalid file types are rejected before upload
- Expired tokens return appropriate error messages
