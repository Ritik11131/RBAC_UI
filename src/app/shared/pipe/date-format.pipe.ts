import { Pipe, PipeTransform } from '@angular/core';

export type DateFormatType = 'short' | 'medium' | 'long' | 'full' | 'date' | 'time' | 'datetime' | 'relative';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  /**
   * Transform a date string or Date object to a formatted string
   * @param value Date string, Date object, or timestamp
   * @param format Format type: 'short', 'medium', 'long', 'full', 'date', 'time', 'datetime', or 'relative'
   * @param locale Locale string (default: 'en-US')
   * @returns Formatted date string
   */
  transform(
    value: string | Date | number | null | undefined,
    format: DateFormatType = 'medium',
    locale: string = 'en-US'
  ): string {
    if (!value) {
      return '';
    }

    // Convert to Date object
    const date = this.toDate(value);
    if (!date || isNaN(date.getTime())) {
      return '';
    }

    // Handle relative time format
    if (format === 'relative') {
      return this.getRelativeTime(date);
    }

    // Handle other formats
    const options: Intl.DateTimeFormatOptions = this.getFormatOptions(format);
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  /**
   * Convert various date formats to Date object
   */
  private toDate(value: string | Date | number): Date | null {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  /**
   * Get Intl.DateTimeFormatOptions based on format type
   */
  private getFormatOptions(format: DateFormatType): Intl.DateTimeFormatOptions {
    switch (format) {
      case 'short':
        return {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
      case 'medium':
        return {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
      case 'long':
        return {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        };
      case 'full':
        return {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        };
      case 'date':
        return {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        };
      case 'time':
        return {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        };
      case 'datetime':
        return {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
      default:
        return {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
    }
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   */
  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const absDiff = Math.abs(diffInSeconds);

    // Seconds
    if (absDiff < 60) {
      return diffInSeconds < 0 ? 'in a few seconds' : 'a few seconds ago';
    }

    // Minutes
    const minutes = Math.floor(absDiff / 60);
    if (minutes < 60) {
      return diffInSeconds < 0
        ? `in ${minutes} minute${minutes !== 1 ? 's' : ''}`
        : `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    // Hours
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return diffInSeconds < 0
        ? `in ${hours} hour${hours !== 1 ? 's' : ''}`
        : `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    // Days
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return diffInSeconds < 0
        ? `in ${days} day${days !== 1 ? 's' : ''}`
        : `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    // Months
    const months = Math.floor(days / 30);
    if (months < 12) {
      return diffInSeconds < 0
        ? `in ${months} month${months !== 1 ? 's' : ''}`
        : `${months} month${months !== 1 ? 's' : ''} ago`;
    }

    // Years
    const years = Math.floor(months / 12);
    return diffInSeconds < 0
      ? `in ${years} year${years !== 1 ? 's' : ''}`
      : `${years} year${years !== 1 ? 's' : ''} ago`;
  }
}

