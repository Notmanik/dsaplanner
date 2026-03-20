# DSA Planner Backend

The backend for the **DSA Planner** application. It generates a personalized daily DSA study plan based on a user's proficiency level across various topics, structured around chronological dates.

## Technology Stack
- **Node.js**: Runtime environment
- **Express.js**: Web framework for building the REST API
- **MongoDB & Mongoose**: Database and object modeling for storing Users, Questions, and Plans
- **JWT (JSON Web Tokens) & bcryptjs**: For user authentication and security
- **csv-parser**: For ingesting initial question data from the provided CSV file

## Prerequisites
- Node.js installed locally
- A local or remote MongoDB instance running (default is `mongodb://localhost:27017/dsaplanner`)

## Environment Variables
Create a `.env` file in the root of the `backend` directory with the following optional overrides (the app has fallback defaults built-in):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dsaplanner
JWT_SECRET=your_jwt_secret_key
```

## Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Seed the Database**
   This script parses `data.csv` and populates the MongoDB `Question` collection (1825 LeetCode questions). You only need to run this once.
   ```bash
   node scripts/seedData.js
   ```

3. **Start the Server**
   ```bash
   node index.js
   ```
   *The server will start on port 5000 by default.*

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register a new user (`{ username, password }`). Returns a 30-minute JWT token.
- `POST /api/auth/login`: Authenticate an existing user (`{ username, password }`). Returns a JWT token.

### Plans (`/api/plans`) - *Protected by JWT Middleware*
*Requires `x-auth-token` or `Authorization: Bearer <token>` in the request headers.*

- `POST /api/plans/generate`:
  Generates a new chronological plan based on the chosen duration and topic proficiencies. Level ranges from 1 (Beginner/Easy focus) to 5 (Advanced/Hard focus).
  ```json
  // Request Body Payload
  {
    "duration": 5,
    "startDate": "2023-11-01T00:00:00.000Z",
    "userLevels": {
      "Array": 1,
      "Dynamic Programming": 5,
      "Sliding Window": 2
    }
  }
  ```

- `GET /api/plans/:id`:
  Retrieves a previously generated plan, validating the authenticated user owns it. Fully populates the daily conceptual question buckets (Title, URL, Difficulty, Topics) for easy rendering on a frontend UI calendar.
