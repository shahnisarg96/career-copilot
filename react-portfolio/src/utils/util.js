export const careerStartDate = new Date('2018-01-01');
export function getExperienceYears() {
    const now = new Date();
    const diff = now - careerStartDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

// Central API Gateway base URL for all frontend requests
export const API_BASE = (import.meta?.env?.VITE_API_BASE) || 'http://localhost:8080';

export function apiUrl(path = '') {
    if (!path) return API_BASE;
    if (/^https?:\/\//i.test(path)) return path;
    const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
}

export function unwrapApiResponse(payload) {
    if (!payload) return payload;
    if (Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data;
    if (Object.prototype.hasOwnProperty.call(payload, 'value')) return payload.value;
    return payload;
}