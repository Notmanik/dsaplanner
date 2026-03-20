# Next Phase TODOs

## Security & Rate Limiting
- Add `express-rate-limit` middleware to all authentication endpoints (Max 10 requests / 15 minutes) to deter brute force attacks.

## User Engagement & Analytics
- Integrate `bullmq` or `bull` with Redis.
- Implement background job processing to queue daily reminder emails using `nodemailer`, targeting the user's `preferredEmailTime`.
