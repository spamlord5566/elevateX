const { z } = require('zod');

const phoneRegex = /^[0-9+\s()-]{8,20}$/;

const registrationPayloadSchema = z.object({
  name: z.string({ required_error: 'Participant name is required' })
    .trim()
    .min(2, 'Participant name must be at least 2 characters')
    .max(50, 'Participant name cannot exceed 50 characters'),
  email: z.string({ required_error: 'Participant email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid participant email address'),
  phone: z.string({ required_error: 'Participant phone number is required' })
    .trim()
    .min(8, 'Participant phone number must be at least 8 digits')
    .max(20, 'Member phone number is too long')
    .regex(phoneRegex, 'Invalid participant phone number'),
  trackId: z.enum(['ai-ml', 'web3', 'open-innovation', 'sustainability', 'fintech', 'healthtech'], {
    error_map: () => ({ message: 'Invalid track ID selected' })
  })
});

const validateRegistration = (req, res, next) => {
  try {
    const parsed = registrationPayloadSchema.safeParse(req.body);

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map((err) => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessages || 'Invalid registration details'
      });
    }

    req.body = parsed.data;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateRegistration
};
