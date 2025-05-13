/**
 * Theme Configuration Utility
 * 
 * Contains theme settings, types, and helper functions for consistent styling across the application.
 */

// Theme color palette
export interface ThemeColors {
    primary: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
    };
    secondary: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
    };
    error: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
    };
    warning: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
    };
    info: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
    };
    success: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
    };
    grey: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    text: {
        primary: string;
        secondary: string;
        disabled: string;
    };
    background: {
        default: string;
        paper: string;
        alt: string;
    };
}

// Typography definitions
export interface ThemeTypography {
    fontFamily: string;
    fontSize: number;
    fontWeightLight: number;
    fontWeightRegular: number;
    fontWeightMedium: number;
    fontWeightBold: number;
    h1: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
    };
    h2: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
    };
    h3: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
    };
    h4: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
    };
    h5: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
    };
    h6: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
    };
    body1: {
        fontSize: string;
        lineHeight: number;
    };
    body2: {
        fontSize: string;
        lineHeight: number;
    };
    button: {
        fontSize: string;
        textTransform: string;
        fontWeight: number;
    };
}

// Breakpoints for responsive design
export interface ThemeBreakpoints {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
}

// Spacing units
export interface ThemeSpacing {
    unit: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
}

// Main theme interface
export interface Theme {
    mode: 'light' | 'dark';
    colors: ThemeColors;
    typography: ThemeTypography;
    breakpoints: ThemeBreakpoints;
    spacing: ThemeSpacing;
    borderRadius: number;
    shadows: string[];
}

// Default light theme
export const lightTheme: Theme = {
    mode: 'light',
    colors: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
            contrastText: '#ffffff',
        },
        error: {
            main: '#d32f2f',
            light: '#ef5350',
            dark: '#c62828',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#ed6c02',
            light: '#ff9800',
            dark: '#e65100',
            contrastText: '#ffffff',
        },
        info: {
            main: '#0288d1',
            light: '#03a9f4',
            dark: '#01579b',
            contrastText: '#ffffff',
        },
        success: {
            main: '#2e7d32',
            light: '#4caf50',
            dark: '#1b5e20',
            contrastText: '#ffffff',
        },
        grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
            alt: '#f9f9f9',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.2,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.2,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: 1.2,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.2,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.43,
        },
        button: {
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            fontWeight: 500,
        },
    },
    breakpoints: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
    },
    spacing: {
        unit: 8,
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: 4,
    shadows: [
        'none',
        '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
        '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
        '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    ],
};

// Default dark theme - derived from light theme with adjusted colors
export const darkTheme: Theme = {
    ...lightTheme,
    mode: 'dark',
    colors: {
        ...lightTheme.colors,
        primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
            contrastText: '#000000',
        },
        secondary: {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ab47bc',
            contrastText: '#000000',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
            alt: '#262626',
        },
    },
};

// Default theme is light
export const defaultTheme = lightTheme;

// Helper functions
export const spacing = (multiplier: number): string => {
    return `${defaultTheme.spacing.unit * multiplier}px`;
};

export const getBreakpointValue = (breakpoint: keyof ThemeBreakpoints): number => {
    return defaultTheme.breakpoints[breakpoint];
};

export const media = {
    up: (breakpoint: keyof ThemeBreakpoints): string => 
        `@media (min-width: ${defaultTheme.breakpoints[breakpoint]}px)`,
    down: (breakpoint: keyof ThemeBreakpoints): string => 
        `@media (max-width: ${defaultTheme.breakpoints[breakpoint] - 0.05}px)`,
    between: (start: keyof ThemeBreakpoints, end: keyof ThemeBreakpoints): string => 
        `@media (min-width: ${defaultTheme.breakpoints[start]}px) and (max-width: ${defaultTheme.breakpoints[end] - 0.05}px)`,
};

const theme = {
    lightTheme,
    darkTheme,
    defaultTheme,
    spacing,
    getBreakpointValue,
    media,
};

export default theme;