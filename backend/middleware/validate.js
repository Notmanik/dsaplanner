const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    console.error('Zod Validation Error:', err);
    return res.status(400).json({ error: err.errors || err.message || 'Validation error' });
  }
};

const registerSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const generatePlanSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Plan name is required').max(80, 'Plan name too long').optional(),
    duration: z.number().int().positive(),
    startDate: z.string().datetime(),
    userLevels: z.record(z.string(), z.number().int().min(1).max(5)),
  }),
});

const completeProblemSchema = z.object({
  body: z.object({
    questionId: z.string(),
    score: z.number().int().min(0).max(5),
    status: z.enum(['pending', 'completed', 'skipped']),
  }),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  generatePlanSchema,
  completeProblemSchema,
};
