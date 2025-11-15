import { DateFormatPipe } from '../pipe/date-format.pipe';

/**
 * Utility functions for date formatting
 * Can be used anywhere in TypeScript files without instantiating the pipe
 */

const dateFormatPipe = new DateFormatPipe();

/**
 * Format a date value using the DateFormatPipe
 * @param value Date string, Date object, or timestamp
 * @param format Format type: 'short', 'medium', 'long', 'full', 'date', 'time', 'datetime', or 'relative'
 * @param locale Locale string (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(
  value: string | Date | number | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' | 'date' | 'time' | 'datetime' | 'relative' = 'medium',
  locale: string = 'en-US'
): string {
  return dateFormatPipe.transform(value, format, locale);
}

/**
 * Format date to short format (e.g., "Jan 15, 2024, 10:30 AM")
 */
export function formatDateShort(value: string | Date | number | null | undefined): string {
  return formatDate(value, 'short');
}

/**
 * Format date to medium format (default)
 */
export function formatDateMedium(value: string | Date | number | null | undefined): string {
  return formatDate(value, 'medium');
}

/**
 * Format date to date only (e.g., "Jan 15, 2024")
 */
export function formatDateOnly(value: string | Date | number | null | undefined): string {
  return formatDate(value, 'date');
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatDateRelative(value: string | Date | number | null | undefined): string {
  return formatDate(value, 'relative');
}

