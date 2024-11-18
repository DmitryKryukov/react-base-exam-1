function relativeTimeFormat(date: Date): string {
    const now = new Date();
    const differenceInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });

    const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit }> = [
        { limit: 60, unit: 'second' },
        { limit: 3600, unit: 'minute' },
        { limit: 86400, unit: 'hour' },
        { limit: 2592000, unit: 'day' },
        { limit: 31536000, unit: 'month' }
    ];

    const absDifferenceInSeconds = Math.abs(differenceInSeconds);

    for (let i = 0; i < thresholds.length; i++) {
        const { limit, unit } = thresholds[i];
        if (absDifferenceInSeconds < limit) {
            const divider = i === 0 ? 1 : thresholds[i - 1].limit;
            const value = Math.floor(absDifferenceInSeconds / divider);
            return rtf.format(differenceInSeconds < 0 ? -value : value, unit);
        }
    }

    return rtf.format(differenceInSeconds < 0 ? -Math.floor(absDifferenceInSeconds / 31536000) : Math.floor(absDifferenceInSeconds / 31536000), 'year');
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseFormattedDateTime(formattedDateTime) {
    const [datePart, timePart] = formattedDateTime.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
}

function isBeforeNow(date: Date): boolean {
    const now = new Date();
    return date > now;
}

export { relativeTimeFormat, formatDate, parseFormattedDateTime, isBeforeNow };