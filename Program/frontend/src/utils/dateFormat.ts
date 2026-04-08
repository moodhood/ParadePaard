const pad = (value: number) => String(value).padStart(2, "0");

const parseDateOnly = (value: string) => {
    const datePart = value.split("T")[0].split(" ")[0];
    const parts = datePart.split("-");
    if (parts.length !== 3) return null;
    if (parts[0].length !== 4) return null;
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    return new Date(year, month - 1, day);
};

export const formatDate = (value?: string | null): string => {
    if (!value) return "-";
    const date = parseDateOnly(value);
    if (!date || Number.isNaN(date.getTime())) return value;
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const formatDateObject = (value?: Date | null): string => {
    if (!value || Number.isNaN(value.getTime())) return "-";
    return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
};

export const formatDateTime = (value?: string | null): string => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return formatDate(value);
    const datePart = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return `${datePart} - ${timePart}`;
};

export const formatMaybeDateTime = (value?: string | null): string => {
    if (!value) return "-";
    const hasTime = /\d{2}:\d{2}/.test(value);
    return hasTime ? formatDateTime(value) : formatDate(value);
};
