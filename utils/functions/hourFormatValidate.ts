export function hourFormatValidation(hour: string): boolean {
    const hourRegex = /^([01][0-9]|2[0-3]):([03]0)$/;
    return hourRegex.test(hour);
}