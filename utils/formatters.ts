/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a number as currency
 * @param value - The value to format
 * @param locale - The locale to use (default: 'de-DE')
 * @param currency - The currency code (default: 'EUR')
 * @returns Formatted currency string
 */
export const formatCurrency = (
    value: number,
    locale: string = 'de-DE',
    currency: string = 'EUR'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(value);
};

/**
 * Format a date
 * @param date - The date to format (Date object or ISO string)
 * @param format - The format style (default: 'medium')
 * @param locale - The locale to use (default: 'de-DE')
 * @returns Formatted date string
 */
export const formatDate = (
    date: Date | string,
    format: 'short' | 'medium' | 'long' = 'medium',
    locale: string = 'de-DE'
): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: format === 'short' ? 'numeric' : 'long',
        year: 'numeric',
    };
    
    if (format === 'long') {
        options.weekday = 'long';
    }
    
    return dateObj.toLocaleDateString(locale, options);
};

/**
 * Format a number
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @param locale - The locale to use (default: 'de-DE')
 * @returns Formatted number string
 */
export const formatNumber = (
    value: number,
    decimals: number = 0,
    locale: string = 'de-DE'
): string => {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};

/**
 * Format a value as percentage
 * @param value - The value to format (0-100 or 0-1)
 * @param decimals - Number of decimal places (default: 0)
 * @param locale - The locale to use (default: 'de-DE')
 * @returns Formatted percentage string
 */
export const formatPercentage = (
    value: number,
    decimals: number = 0,
    locale: string = 'de-DE'
): string => {
    // Normalize value to be between 0-100
    const normalizedValue = value > 1 ? value : value * 100;
    
    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(normalizedValue / 100);
};

/**
 * Format a license plate
 * @param plate - The license plate string
 * @returns Formatted license plate
 */
export const formatPlate = (plate: string): string => {
    // Basic German license plate formatting
    // This can be customized based on specific requirements
    return plate.toUpperCase();
};

/**
 * Format a distance/mileage value
 * @param value - The value to format
 * @param unit - The unit to display (default: 'km')
 * @param locale - The locale to use (default: 'de-DE')
 * @returns Formatted distance string
 */
export const formatDistance = (
    value: number,
    unit: string = 'km',
    locale: string = 'de-DE'
): string => {
    return `${formatNumber(value, 0, locale)} ${unit}`;
};

/**
 * Format a duration in minutes to hours and minutes
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins} min`;
    } else if (mins === 0) {
        return `${hours} h`;
    } else {
        return `${hours} h ${mins} min`;
    }
};