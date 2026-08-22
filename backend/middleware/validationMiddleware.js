const { z } = require('zod');

const phoneRegex = /^[0-9+\s()-]{8,20}$/;

const memberSchema = z.object({
  name: z.string({ required_error: 'Member name is required' })
    .trim()
    .min(2, 'Member name must be at least 2 characters')
    .max(50, 'Member name cannot exceed 50 characters'),
  email: z.string({ required_error: 'Member email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid member email address'),
  phone: z.string({ required_error: 'Member phone number is required' })
    .trim()
    .min(8, 'Member phone number must be at least 8 digits')
    .max(20, 'Member phone number is too long')
    .regex(phoneRegex, 'Invalid member phone number')
});

const registrationPayloadSchema = z.object({
  teamName: z.string({ required_error: 'Team name is required' })
    .trim()
    .min(2, 'Team name must be at least 2 characters')
    .max(50, 'Team name cannot exceed 50 characters'),
  trackId: z.enum(['ai-ml', 'web3', 'open-innovation', 'sustainability', 'fintech', 'healthtech'], {
    error_map: () => ({ message: 'Invalid track ID selected' })
  }),
  leaderName: z.string({ required_error: 'Leader name is required' })
    .trim()
    .min(2, 'Leader name must be at least 2 characters')
    .max(50, 'Leader name cannot exceed 50 characters'),
  leaderEmail: z.string({ required_error: 'Leader email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid leader email address'),
  leaderPhone: z.string({ required_error: 'Leader phone number is required' })
    .trim()
    .min(8, 'Leader phone number must be at least 8 digits')
    .max(20, 'Leader phone number is too long')
    .regex(phoneRegex, 'Invalid leader phone number'),
  members: z.array(memberSchema)
    .max(3, 'A team can have at most 3 additional members')
    .default([])
});

const safeParseMembers = (membersValue) => {
  if (Array.isArray(membersValue)) return membersValue;
  if (typeof membersValue === 'string') {
    try {
      const parsed = JSON.parse(membersValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }
  return [];
};

const validateRegistration = (req, res, next) => {
  try {
    const body = { ...req.body, members: safeParseMembers(req.body.members) };
    const parsed = registrationPayloadSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map((err) => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessages || 'Invalid registration details'
      });
    }

    const { leaderEmail, members } = parsed.data;
    const emails = [leaderEmail, ...members.map((m) => m.email)];
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      return res.status(400).json({
        success: false,
        message: 'All email addresses in a registration must be unique.'
      });
    }

    if (members.length + 1 > 4) {
      return res.status(400).json({
        success: false,
        message: 'A team cannot have more than 4 participants.'
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
