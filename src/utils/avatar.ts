export const AVATAR_COLORS = [
    '#6b7cff', // periwinkle
    '#ff8a5c', // peach
    '#4fa872', // ok
    '#b388eb', // lavender
    '#3a8fa6', // teal
    '#c25e95', // berry
    '#e6a532', // amber
    '#5fa8d3', // sky
    '#d05a5a', // coral
];

export function getInitials(name: string | null | undefined): string {
    const trimmed = name?.trim();
    if (!trimmed) return '?';
    const parts = trimmed.split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]).join('').toUpperCase() || '?';
}

export function getAvatarColor(seed: number): string {
    return AVATAR_COLORS[Math.abs(seed) % AVATAR_COLORS.length];
}
