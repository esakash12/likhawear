import React from 'react';

/**
 * Form Validation and Input Sanitization Utilities
 * Enforces strict numeric & valid Bangladeshi phone constraints across all forms.
 */

/**
 * Strips all non-digit characters from the input string.
 * Example: 017-123.456 abc -> 017123456
 */
export const sanitizeDigitsOnly = (value: string, maxLength?: number): string => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
};

/**
 * Sanitizes and normalizes a Bangladeshi mobile phone number.
 * - Strips any non-digit characters (letters, spaces, dashes, symbols)
 * - Automatically strips country code prefix (88 / +88) so it stays clean '01XXXXXXXXX'
 * - Restricts length to 11 digits
 */
export const sanitizeBdPhone = (value: string): string => {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8801')) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 11);
};

/**
 * Validates whether a phone number is a valid 11-digit Bangladeshi mobile number.
 * Must start with 013, 014, 015, 016, 017, 018, or 019 and be exactly 11 digits.
 */
export const isValidBdPhone = (phone: string): boolean => {
  if (!phone) return false;
  const clean = sanitizeBdPhone(phone);
  return /^01[3-9]\d{8}$/.test(clean);
};

/**
 * Blocks non-numeric keys in onKeyDown event.
 * Allows standard navigation and editing keys (Backspace, Tab, Delete, Arrows, Ctrl/Cmd shortcuts).
 */
export const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Allow Ctrl / Cmd combinations (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z)
  if (e.ctrlKey || e.metaKey) return;

  // Allow navigation and editing keys
  const allowedKeys = [
    'Backspace',
    'Tab',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'Enter'
  ];

  if (allowedKeys.includes(e.key)) return;

  // If the key is not a digit 0-9, prevent typing
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

/**
 * Sanitizes a positive integer (e.g. stock, quantity, item counts).
 */
export const sanitizePositiveInteger = (value: string | number, min = 0, max = 999999): number => {
  const digits = typeof value === 'string' ? value.replace(/\D/g, '') : Math.floor(Number(value) || 0);
  const num = parseInt(String(digits), 10);
  if (isNaN(num) || num < min) return min;
  return Math.min(num, max);
};

/**
 * Sanitizes a positive monetary amount (e.g. price, discount, delivery fee).
 */
export const sanitizePositiveDecimal = (value: string | number, min = 0): number => {
  const str = String(value).replace(/[^0-9.]/g, '');
  // Disallow multiple decimal points
  const parts = str.split('.');
  const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : str;
  const num = parseFloat(sanitized);
  if (isNaN(num) || num < min) return min;
  return Math.round(num * 100) / 100;
};
