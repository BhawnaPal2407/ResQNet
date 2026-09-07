# ResQNet Admin Panel — Frontend Implementation Guide

Base URL: `http://localhost:8080`  
All admin endpoints require a Bearer JWT token from a user with role `ADMIN`.

---

## Authentication

### Login as Admin
```
POST /api/auth/login
Content-Type: application/json

{ "email": "admin@example.com", "password": "yourpassword" }
```
**Response:**
```json
{
  "token": "<jwt>",
  "userId": 1,
  "name": "Admin Name",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```
Store the `token` in localStorage/sessionStorage. Attach it to every admin request:
```
Authorization: Bearer <token>
```
If `role !== "ADMIN"` on login response, redirect away — the backend will block all `/api/admin/**` calls with 403.

---

## Dashboard

### GET /api/admin/dashboard
Returns platform-wide statistics for the overview page.

**Response:**
```json
{
  "totalUsers": 120,
  "totalAdmins": 2,
  "totalDonors": 45,
  "totalVolunteers": 18,
  "totalNGOs": 12,
  "totalHospitals": 5,
  "totalBloodDonors": 60,
  "availableBloodDonors": 34,
  "totalBloodRequests": 88,
  "openBloodRequests": 14,
  "completedBloodRequests": 50,
  "totalEmergencyRequests": 35,
  "openEmergencyRequests": 6,
  "resolvedEmergencyRequests": 22,
  "pendingVolunteers": 4,
  "pendingNGOs": 3
}
```
**Suggested UI:** Stat cards at the top of the dashboard. Show `pendingVolunteers` and `pendingNGOs` as badges/alerts linking to the verification queues.

---

## User Management

### GET /api/admin/users
List all users.

Optional filter by role:
```
GET /api/admin/users?role=DONOR
```
Role values: `ADMIN`, `USER`, `DONOR`, `VOLUNTEER`, `HOSPITAL`, `NGO`

**Response:** Array of:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+911234567890",
  "role": "DONOR",
  "createdAt": "2025-01-15T10:30:00"
}
```

---

### GET /api/admin/users/{id}
Get a single user by ID.

**Response:** Same shape as above.

---

### PATCH /api/admin/users/{id}/role
Change a user's role.

```
PATCH /api/admin/users/5/role
Content-Type: application/json

{ "role": "VOLUNTEER" }
```
**Response:** Updated user object.

**Suggested UI:** Dropdown in user row or a modal with role selector.

---

### DELETE /api/admin/users/{id}
Permanently delete a user. Returns `204 No Content`.

> ⚠️ This is destructive and cascades to associated data. Show a confirmation dialog before calling.

---

## Blood Donor Management

### GET /api/admin/blood-donors
List all blood donor profiles.

**Response:** Array of:
```json
{
  "id": 3,
  "userId": 7,
  "donorName": "Jane Smith",
  "donorPhone": "+911234567890",
  "bloodGroup": "O+",
  "city": "Mumbai",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "available": true,
  "lastDonationDate": "2025-06-01",
  "createdAt": "2025-01-20T08:00:00"
}
```

---

### DELETE /api/admin/blood-donors/{id}
Remove a donor profile. Returns `204 No Content`.

---

## Blood Request Management

### GET /api/admin/blood-requests
List all blood requests (all statuses).

**Response:** Array of:
```json
{
  "id": 10,
  "requesterId": 4,
  "requesterName": "Rahul Kumar",
  "bloodGroup": "AB+",
  "units": 2,
  "hospitalName": "City Hospital",
  "city": "Delhi",
  "urgency": "HIGH",
  "status": "OPEN",
  "matchedDonorId": null,
  "createdAt": "2025-09-01T12:00:00",
  "updatedAt": "2025-09-01T12:00:00"
}
```

**Status values:** `OPEN`, `MATCHING`, `DONOR_NOTIFIED`, `DONOR_ACCEPTED`, `DONATION_IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `EXPIRED`

**Urgency values:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

---

### PATCH /api/admin/blood-requests/{id}/status
Override a blood request's status.
```
PATCH /api/admin/blood-requests/10/status?status=COMPLETED
```
**Response:** Updated blood request object.

---

### DELETE /api/admin/blood-requests/{id}
Delete a blood request. Returns `204 No Content`.

---

## Emergency Request Management

### GET /api/admin/emergency-requests
List all emergency requests (all statuses).

**Response:** Array of:
```json
{
  "id": 5,
  "requesterId": 9,
  "requesterName": "Priya Singh",
  "category": "ROAD_ACCIDENT",
  "description": "Car crash on highway 8",
  "city": "Pune",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "urgency": "CRITICAL",
  "status": "OPEN",
  "createdAt": "2025-09-02T09:15:00",
  "updatedAt": "2025-09-02T09:15:00"
}
```

**Status values:** `OPEN`, `MATCHING`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED`, `EXPIRED`

**Category values:** `ROAD_ACCIDENT`, `FIRE`, `MEDICAL_EMERGENCY`, `NATURAL_DISASTER`, `MISSING_PERSON`, `RESCUE`, `OTHER`

---

### PATCH /api/admin/emergency-requests/{id}/status
Override status.
```
PATCH /api/admin/emergency-requests/5/status?status=RESOLVED
```

---

### DELETE /api/admin/emergency-requests/{id}
Delete an emergency request. Returns `204 No Content`.

---

## Volunteer Management

### GET /api/admin/volunteers
List all volunteer profiles (all verification statuses).

**Response:** Array of:
```json
{
  "id": 2,
  "userId": 11,
  "volunteerName": "Amit Sharma",
  "organizationName": "HelpFirst NGO",
  "services": "First Aid, Rescue",
  "serviceArea": "Mumbai",
  "available": true,
  "verificationStatus": "PENDING",
  "contactName": "Amit Sharma",
  "contactPhone": "+919876543210",
  "createdAt": "2025-08-10T14:00:00"
}
```

**Verification status values:** `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`

---

### GET /api/admin/volunteers/pending
List only volunteers with `verificationStatus = PENDING`. Use this for the verification queue page.

---

### PATCH /api/admin/volunteers/{id}/verify
Approve, reject, or suspend a volunteer.
```
PATCH /api/admin/volunteers/2/verify?status=APPROVED
```
**Response:** Updated volunteer object.

**Suggested UI:** Action buttons (Approve / Reject / Suspend) in each row of the pending queue table.

---

### DELETE /api/admin/volunteers/{id}
Delete a volunteer profile. Returns `204 No Content`.

---

## NGO Management

### GET /api/admin/ngos
List all NGO profiles (all verification statuses).

**Response:** Array of:
```json
{
  "id": 3,
  "userId": 15,
  "organizationName": "Red Cross India",
  "services": "Blood bank, Disaster relief",
  "serviceArea": "Nationwide",
  "available": true,
  "verificationStatus": "PENDING",
  "contactName": "Sunita Mehta",
  "contactPhone": "+911122334455",
  "createdAt": "2025-07-05T09:00:00"
}
```

---

### GET /api/admin/ngos/pending
List only NGOs with `verificationStatus = PENDING`.

---

### PATCH /api/admin/ngos/{id}/verify
Approve, reject, or suspend an NGO.
```
PATCH /api/admin/ngos/3/verify?status=APPROVED
```

---

### DELETE /api/admin/ngos/{id}
Delete an NGO profile. Returns `204 No Content`.

---

## Error Responses

All errors follow this shape:
```json
{
  "timestamp": "2025-09-02T10:15:30",
  "status": 404,
  "message": "User not found: 99"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Validation error (check `errors` field) |
| 401 | Missing or expired JWT |
| 403 | Logged in but not ADMIN |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 500 | Unexpected server error |

---

## Suggested Admin Panel Page Structure

```
/admin
  /dashboard            ← Stats overview
  /users                ← User list with role filter
  /users/:id            ← User detail + role change
  /blood-donors         ← Blood donor list
  /blood-requests       ← All blood requests with status management
  /emergency-requests   ← All emergency requests with status management
  /volunteers           ← All volunteers
  /volunteers/pending   ← Verification queue (badge count from dashboard)
  /ngos                 ← All NGOs
  /ngos/pending         ← Verification queue (badge count from dashboard)
```

### Axios Interceptor Setup (React example)
```js
import axios from 'axios';

const adminApi = axios.create({ baseURL: 'http://localhost:8080/api/admin' });

adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      // redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default adminApi;
```

### Example: Fetch Dashboard Stats
```js
const { data } = await adminApi.get('/dashboard');
```

### Example: Verify a Volunteer
```js
await adminApi.patch(`/volunteers/${id}/verify?status=APPROVED`);
```

### Example: Change User Role
```js
await adminApi.patch(`/users/${id}/role`, { role: 'VOLUNTEER' });
```
