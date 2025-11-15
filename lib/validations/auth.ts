// Shared validation schemas for authentication
// lib/validations/auth.ts

import { z } from 'zod';

// Email validation
export const emailSchema = z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ')
    .toLowerCase()
    .trim();

// Name validation
export const nameSchema = z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được quá 100 ký tự')
    .regex(/^[\p{L}\s]+$/u, 'Tên chỉ được chứa chữ cái và khoảng trắng')
    .trim();

// Password validation
export const passwordSchema = z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(128, 'Mật khẩu không được quá 128 ký tự')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
    .regex(/[@$!%*?&#]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&#)');

// Password rules for client-side validation
export const PASSWORD_RULES = {
    minLength: 8,
    hasLowercase: /[a-z]/,
    hasUppercase: /[A-Z]/,
    hasNumber: /[0-9]/,
    hasSpecial: /[@$!%*?&#]/,
};

// validate password on client
export const validatePassword = (password: string): string | null => {
    try {
        passwordSchema.parse(password);
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.issues[0].message;
        }
        return 'Mật khẩu không hợp lệ';
    }
};

// function to validate email on client
export const validateEmail = (email: string): string | null => {
    try {
        emailSchema.parse(email);
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.issues[0].message;
        }
        return 'Email không hợp lệ';
    }
};

// function to validate name on client
export const validateName = (name: string): string | null => {
    try {
        nameSchema.parse(name);
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.issues[0].message;
        }
        return 'Tên không hợp lệ';
    }
};

// Complete schemas for API routes
export const registerSchema = z.object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema,
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token không hợp lệ'),
    password: passwordSchema,
});