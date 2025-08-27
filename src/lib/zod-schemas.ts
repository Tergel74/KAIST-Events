import { z } from "zod";

export const createEventSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    location: z
        .string()
        .max(200, "Location must be less than 200 characters")
        .optional(),
    event_date: z
        .string()
        .transform((str) => new Date(str))
        .refine((date) => {
            const now = new Date();
            return date > now;
        }, "Event date must be in the future"),
    image_url: z
        .array(z.url())
        .max(1, "Only 1 image allowed")
        .optional()
        .default([]),
});

export const joinEventSchema = z.object({
    event_id: z.uuid("Invalid event ID"),
});

export const createReviewSchema = z.object({
    event_id: z.uuid("Invalid event ID"),
    content: z
        .string()
        .min(1, "Review content is required")
        .max(1000, "Review must be less than 1000 characters"),
    photo_urls: z.array(z.url()).optional().default([]),
});

export const updateEventStatusSchema = z.object({
    status: z.enum(["upcoming", "started", "finished"]),
});

export const eventFiltersSchema = z.object({
    date_range: z
        .enum(["today", "week", "all", "past"])
        .optional()
        .default("all"),
    category: z.string().optional(),
    limit: z.number().min(1).max(50).optional().default(20),
    offset: z.number().min(0).optional().default(0),
});

export const uploadUrlSchema = z.object({
    file_name: z.string().min(1, "File name is required"),
    file_type: z.enum([
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ]),
    file_size: z
        .number()
        .max(5 * 1024 * 1024, "File size must be less than 5MB"),
});

// Authentication schemas
export const signUpSchema = z
    .object({
        email: z
            .string()
            .email("Invalid email format")
            .refine((email) => {
                return email.endsWith("@kaist.ac.kr");
            }, "Only KAIST email addresses are allowed"),
        name: z
            .string()
            .min(1, "Name is required")
            .max(100, "Name must be less than 100 characters"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password must be less than 100 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email format"),
    token: z
        .string()
        .min(6, "OTP must be 6 digits")
        .max(6, "OTP must be 6 digits"),
});

export const signInSchema = z.object({
    email: z
        .string()
        .email("Invalid email format")
        .refine((email) => {
            return email.endsWith("@kaist.ac.kr");
        }, "Only KAIST email addresses are allowed"),
    password: z.string().optional(),
    loginMethod: z.enum(["password", "magic_link"]).default("password"),
});

export const resendOtpSchema = z.object({
    email: z.string().email("Invalid email format"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type JoinEventInput = z.infer<typeof joinEventSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>;
export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
