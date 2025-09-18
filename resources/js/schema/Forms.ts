import { z } from 'zod';

// const email = z.string().email({ message: "Invalid email address" });
const password = z.string().superRefine((value, ctx) => {
    if (!value) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password is required',
        });
        return false;
    }
    if (value.length < 8) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must be at least 8 characters long',
        });
        return false;
    }
    if (!/[a-z]/.test(value)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must contain at least one lowercase letter',
        });
        return false;
    }
    if (!/[A-Z]/.test(value)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must contain at least one uppercase letter',
        });
        return false;
    }
    if (!/\d/.test(value)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must contain at least one number',
        });
        return false;
    }
    if (!/[\W_]/.test(value)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must contain at least one special character',
        });
        return false;
    }
});

// Make sure your password is a minimum of 8 characters and contains a mix of uppercase and lowercase letters, at least one number, and a special character. E.g. (Abc@%$#.!:_-+?/*#)

const loginSchema = z.object({
    email: z.string().min(1, { message: 'Email is required' }),
    password: z.string().min(1, { message: 'Password is required' }),
    rememberMe: z.boolean().default(false).optional(),
});

const contactSchema = z.object({
    email: z.string().min(1, { message: 'Email is required' }),
    name: z.string().min(1, { message: 'Full-Name is required' }),
    message: z.string().min(1, { message: 'Message is required' }),
});

const basicPhoneNumberRegex = /^\+?[\d\s\-()]{7,20}$/;

const registerSchema = z
    .object({
        name: z
            .string()
            .min(1, { message: 'Full name is required' })
            .refine((value) => value.includes(' '), {
                message:
                    'Please enter at least a first and last name (e.g., "John Doe")',
            })
            .refine((value) => value.trim().length >= 6, {
                message: 'Full name must be at least 6 characters',
            })
            .refine((value) => value.trim().length >= 1, {
                message: 'Full name is required',
            }),
        email: z
            .string()
            .email({
                message: 'Invalid email address',
            })
            .min(1, { message: 'Email field is required' }),
        password,
        password_confirmation: z.string(),
        accept_terms: z.boolean().refine((val) => val === true, {
            message: 'You must accept the terms and conditions',
        }),
    })
    .superRefine(({ password_confirmation, password }, ctx) => {
        if (password_confirmation !== password) {
            ctx.addIssue({
                code: 'custom',
                message: 'The passwords do not match',
                path: ['password_confirmation'],
            });
        }
    });

const registerStylistSchema = z
    .object({
        email: z
            .string()
            .email({
                message: 'Invalid email address',
            })
            .min(1, { message: 'Email field is required' }),
        password,
        password_confirmation: z.string(),
        accept_terms: z.boolean().refine((val) => val === true, {
            message: 'You must accept the terms and conditions',
        }),
        phone: z
            .string()
            .regex(basicPhoneNumberRegex, 'Invalid phone number format.')
            .transform((val) => val.trim()),
        first_name: z
            .string()
            .min(3, {
                message: 'First name must be at least 3 characters',
            })
            .min(1, { message: 'First name is required.' }),
        last_name: z
            .string()
            .min(3, {
                message: 'Last name must be at least 3 characters',
            })
            .min(1, { message: 'Last name is required.' }),
    })
    .superRefine(({ password_confirmation, password }, ctx) => {
        if (password_confirmation !== password) {
            ctx.addIssue({
                code: 'custom',
                message: 'The passwords do not match',
                path: ['password_confirmation'],
            });
        }
    });

const resetSchema = z
    .object({
        token: z.string().min(1, { message: 'token is required' }),
        email: z
            .string()
            .email({
                message: 'Invalid email address',
            })
            .min(1, { message: 'Field is required' }),
        password,
        password_confirmation: z.string(),
    })
    .superRefine(({ password_confirmation, password }, ctx) => {
        if (password_confirmation !== password) {
            ctx.addIssue({
                code: 'custom',
                message: 'The passwords do not match',
                path: ['password_confirmation'],
            });
        }
    });

const updateSchema = z
    .object({
        current_password: z
            .string()
            .min(1, { message: 'Current password is required' }),
        password,
        password_confirmation: z.string(),
    })
    .superRefine(({ password_confirmation, password }, ctx) => {
        if (password_confirmation !== password) {
            ctx.addIssue({
                code: 'custom',
                message: 'The passwords did not match',
                path: ['password_confirmation'],
            });
        }
    });

const forgotPasswordSchema = z.object({
    email: z.string().min(1, { message: 'Email is required' }),
});

const otpVerificationSchema = z.object({
    otp: z
        .string()
        .min(6, { message: 'OTP must be at least 6 digits' })
        .max(6, { message: 'OTP must be at most 6 digits' })
        .regex(/^\d+$/, { message: 'OTP must contain only digits' }),
});

export {
    contactSchema,
    forgotPasswordSchema,
    loginSchema,
    otpVerificationSchema,
    registerSchema,
    registerStylistSchema,
    resetSchema,
    updateSchema,
};
