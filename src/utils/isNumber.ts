export const isNumber = (value: unknown): value is number => {
    return !Number.isNaN(value) && typeof value === 'number';
}
