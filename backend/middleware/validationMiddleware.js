const { z } = require('zod');

// Schema definitions
const memberSchema = z.object({
  name: z.string({
    required_error: 'Member name is required'
  })
  .trim()
  .min(2, 'Member name must be at least 2 characters')
  .max(50, 'Member name cannot exceed 50 characters'),
  email: z.string({
    required_error: 'Member email is required'
  })
  .trim()
  .toLowerCase()
  .email('Invalid member email address')
});

const registrationPayloadSchema = z.object({
  teamName: z.string({
    required_error: 'Team name is required'
  })
  .trim()
  .min(2, 'Team name must be at least 2 characters')
  .max(50, 'Team name cannot exceed 50 characters'),
  trackId: z.enum(['ai-ml', 'web3', 'open-innovation', 'sustainability', 'fintech', 'healthtech'], {
    error_map: () => ({ message: 'Invalid track ID selected' })
  }),
  leaderName: z.string({
    required_error: 'Leader name is required'
  })
  .trim()
  .min(2, 'Leader name must be at least 2 characters')
  .max(50, 'Leader name cannot exceed 50 characters'),
  leaderEmail: z.string({
    required_error: 'Leader email is required'
  })
  .trim()
  .toLowerCase()
  .email('Invalid leader email address'),
  members: z.array(memberSchema)
    .max(3, 'A team can have at most 3 additional members')
    .default([])
});

const validateRegistration = (req, res, next) => {
  try {
    const parsed = registrationPayloadSchema.safeParse(req.body);
    
    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessages || 'Invalid registration details'
      });
    }

    const { leaderEmail, members } = parsed.data;
    
    // Check for duplicate emails inside the payload itself
    const emails = [leaderEmail, ...members.map(m => m.email)];
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      return res.status(400).json({
        success: false,
        message: 'All email addresses in a registration must be unique.'
      });
    }

    // Replace req.body with sanitized parsed data
    req.body = parsed.data;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateRegistration
};
