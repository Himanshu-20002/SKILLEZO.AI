# SKILLEZO Backend — Candidate Profile API

The Candidate Profile module allows authenticated candidate users to create and maintain their professional candidate profile, skills, education, work experience, social/portfolio links, and target career role.

---

## Endpoint Summary Table

| Method | Path | Authentication | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/profile` | Required | Create candidate profile |
| `GET` | `/api/profile/me` | Required | Retrieve current candidate profile |
| `PATCH` | `/api/profile/me` | Required | Partial update candidate profile |
| `PATCH` | `/api/profile/me/skills` | Required | Replace skills list |
| `PATCH` | `/api/profile/me/education` | Required | Replace education list |
| `PATCH` | `/api/profile/me/experience` | Required | Replace work experience list |
| `PATCH` | `/api/profile/me/links` | Required | Replace social/portfolio links |
| `PATCH` | `/api/profile/me/target-role` | Required | Update target career role |

---

## 1. Create Profile (`POST /api/profile`)

* **Purpose**: Creates an initial candidate profile for the authenticated user.
* **Authentication**: Required (`requireAuth`).
* **Authorization**: Self-service (Profile bound to `req.user.id`).

### Request Body (`CreateProfileDTO`)
```json
{
  "targetRoleId": "66b8c1f92e40123456789abc",
  "bio": "Senior Full Stack Software Engineer passionate about Next.js and Node.js",
  "skills": [
    {
      "name": "TypeScript",
      "level": 5,
      "source": "PROFILE",
      "verified": true
    }
  ],
  "education": [
    {
      "institution": "Stanford University",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startYear": 2018,
      "endYear": 2022
    }
  ],
  "experience": [
    {
      "companyName": "TechCorp",
      "jobTitle": "Frontend Engineer",
      "employmentType": "FULL_TIME",
      "startDate": "2022-06-01",
      "isCurrent": true,
      "description": "Building modern web applications."
    }
  ],
  "links": {
    "github": "https://github.com/candidate",
    "linkedin": "https://linkedin.com/in/candidate",
    "portfolio": "https://candidate.dev"
  },
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA"
  }
}
```

### Success Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "_id": "66b8c1f92e40123456789def",
    "userId": "usr_123456789",
    "targetRoleId": "66b8c1f92e40123456789abc",
    "bio": "Senior Full Stack Software Engineer passionate about Next.js and Node.js",
    "skills": [
      {
        "name": "TypeScript",
        "level": 5,
        "source": "PROFILE",
        "verified": true
      }
    ],
    "education": [
      {
        "institution": "Stanford University",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "startYear": 2018,
        "endYear": 2022
      }
    ],
    "experience": [
      {
        "companyName": "TechCorp",
        "jobTitle": "Frontend Engineer",
        "employmentType": "FULL_TIME",
        "startDate": "2022-06-01T00:00:00.000Z",
        "endDate": null,
        "isCurrent": true,
        "description": "Building modern web applications."
      }
    ],
    "links": {
      "github": "https://github.com/candidate",
      "linkedin": "https://linkedin.com/in/candidate",
      "portfolio": "https://candidate.dev"
    },
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    },
    "createdAt": "2026-08-11T07:38:00.000Z",
    "updatedAt": "2026-08-11T07:38:00.000Z"
  }
}
```

### Possible Errors
* `401 Unauthorized`: Missing or invalid session cookie.
* `409 Conflict` (`PROFILE_ALREADY_EXISTS`): Candidate profile already exists for this account.

---

## 2. Get My Profile (`GET /api/profile/me`)

* **Purpose**: Retrieves the authenticated user's candidate profile.
* **Authentication**: Required (`requireAuth`).

### Success Response (`200 OK`)
Returns the complete `IProfile` document.

### Possible Errors
* `401 Unauthorized`: Session missing or expired.
* `404 Not Found` (`PROFILE_NOT_FOUND`): Profile has not been created yet.

---

## 3. Update Profile (`PATCH /api/profile/me`)

* **Purpose**: Performs a partial update on the candidate profile. Any omitted fields remain unchanged.
* **Authentication**: Required (`requireAuth`).

### Request Body (`UpdateProfileDTO`)
All fields are optional.

---

## 4. Section-Specific Update Endpoints

### Update Skills (`PATCH /api/profile/me/skills`)
* **Body**: `{ "skills": [ { "name": "Node.js", "level": 4, "source": "PROFILE", "verified": false } ] }`

### Update Education (`PATCH /api/profile/me/education`)
* **Body**: `{ "education": [ { "institution": "MIT", "degree": "M.S." } ] }`

### Update Experience (`PATCH /api/profile/me/experience`)
* **Body**: `{ "experience": [ { "companyName": "Acme", "jobTitle": "Senior Lead" } ] }`

### Update Links (`PATCH /api/profile/me/links`)
* **Body**: `{ "links": { "github": "https://github.com/username" } }`

### Update Target Role (`PATCH /api/profile/me/target-role`)
* **Body**: `{ "targetRoleId": "66b8c1f92e40123456789abc" }` or `{ "targetRoleId": null }`

---

## Frontend Integration Guidance

* **Loading State**: Show skeleton loaders for profile header, skills pills, experience list, and education timeline.
* **Empty State**: If `GET /api/profile/me` returns `404 PROFILE_NOT_FOUND`, render a "Create Candidate Profile" onboarding wizard.
* **Validation Errors**: Skill level must be an integer between 1 and 5. URL fields must be valid URLs or empty strings.

---

## Related Documentation
- [Authentication Guide](../../02-auth/AUTHENTICATION.md)
- [Authorization Guide](../../02-auth/AUTHORIZATION.md)
- [Error Handling Guide](../../02-auth/ERROR_HANDLING.md)
- [Frontend Integration Guide](../../04-integration/FRONTEND_INTEGRATION.md)
- [Database Schema Document](../../05-database/DATABASE_SCHEMA.md)
