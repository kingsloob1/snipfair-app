import { fullscreenOverlay } from './fullscreen-overlay';

export const getInitials = (userName: string | null | undefined) => {
    if (!userName || typeof userName !== 'string') {
        return 'U';
    }

    const nameParts = userName.trim().split(' ');
    const initials = [];
    if (nameParts.length > 1) {
        if (nameParts[0]) initials.push(nameParts[0].charAt(0));
        if (nameParts[1]) initials.push(nameParts[1].charAt(0));
    } else if (nameParts.length === 1 && nameParts[0])
        initials.push(nameParts[0].charAt(0));

    return initials.join('').toUpperCase();
};

export function mergeInertiaFieldErrors(
    errors: Partial<Record<string, string>>,
    field: string,
): string[] {
    const merged: string[] = [];

    if (typeof errors[field] === 'string') {
        merged.push(errors[field] as string);
    }

    for (const key in errors) {
        if (key.startsWith(`${field}.`) && typeof errors[key] === 'string') {
            merged.push(errors[key] as string);
        }
    }

    return merged;
}

export function getPagination(
    current: number,
    total: number,
): (number | string)[] {
    const pages: (number | string)[] = [];

    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    pages.push(1);

    if (current > 3) {
        pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (current < total - 2) {
        pages.push('...');
    }

    pages.push(total);

    return pages;
}

export function setCookie(name: string, value: string, days: number) {
    if (value === 'denied') {
        const now = new Date();
        const endOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999,
        );
        const expires = endOfDay.toUTCString();
        document.cookie = `${name}=${value};expires=${expires};path=/`;
    } else {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }
}

export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const part = parts.pop();
        if (part) {
            return part.split(';').shift() ?? null;
        }
    }
    return null;
}

export const formatDate = (date?: Date | null): string => {
    if (date instanceof Date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return '';
};

export const appointmentPercentage = (current: number, total: number) => {
    if (total === 0) {
        return '0.0%';
    } else {
        const percentage = (current / total) * 100;
        return percentage.toFixed(1) + '%';
    }
};

export const openFullscreenOverlay = (imageUrl: string) => {
    fullscreenOverlay.open(imageUrl);
};
