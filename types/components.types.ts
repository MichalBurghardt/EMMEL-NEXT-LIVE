import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, FormHTMLAttributes, TableHTMLAttributes } from 'react';
import { SelectOption, Status } from './common.types';

/**
 * Component Type Definitions
 * Contains interfaces and types for React components used throughout the Emmel application
 */


// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

// Button Props
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
}

// Input Props
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftAdornment?: ReactNode;
    rightAdornment?: ReactNode;
    isLoading?: boolean;
}

// Select Props
export interface SelectProps<T = string> {
    options: SelectOption<T>[];
    value?: T | T[];
    onChange: (value: T | T[]) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    helperText?: string;
    disabled?: boolean;
    required?: boolean;
    multiple?: boolean;
    searchable?: boolean;
    loading?: boolean;
    clearable?: boolean;
}

// Form Props
export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
    onSubmit: (data: unknown) => void;
    isLoading?: boolean;
}

// Modal Props
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    children: ReactNode;
    footer?: ReactNode;
    closeOnClickOutside?: boolean;
    closeOnEsc?: boolean;
}

// Table Column Definition
export interface TableColumn<T = unknown> {
    header: string;
    accessor: keyof T | ((row: T) => unknown);
    cell?: (value: unknown, row: T) => ReactNode;
    sortable?: boolean;
    width?: string;
}

// Data Table Props
export interface DataTableProps<T = unknown> extends TableHTMLAttributes<HTMLTableElement> {
    data: T[];
    columns: TableColumn<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
    sorting?: {
        column: keyof T | null;
        direction: 'asc' | 'desc';
        onSort: (column: keyof T) => void;
    };
}

// Card Props
export interface CardProps {
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    status?: Status;
    isLoading?: boolean;
    className?: string;
}

// Layout Props
export interface LayoutProps {
    children: ReactNode;
    sidebar?: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
}

// Alert Props
export interface AlertProps {
    title?: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    closable?: boolean;
    onClose?: () => void;
}

// Tabs Props
export interface TabsProps {
    tabs: {
        key: string;
        label: string;
        content: ReactNode;
        disabled?: boolean;
    }[];
    activeTab?: string;
    onChange: (key: string) => void;
}