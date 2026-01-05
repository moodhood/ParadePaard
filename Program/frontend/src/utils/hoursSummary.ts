export type TimesheetLike = {
    userId?: string | null;
    name?: string | null;
    dateOfIssue: string;
    weekNumber?: number | null;
    weekBasedYear?: number | null;
    hoursWorked?: number | null;
};

export type IsoWeek = { weekNumber: number; weekBasedYear: number };

export function getIsoWeek(date: Date): IsoWeek {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const weekBasedYear = d.getUTCFullYear();
    const yearStart = new Date(Date.UTC(weekBasedYear, 0, 1));
    const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000 + 1) as number) / 7);
    return { weekNumber, weekBasedYear };
}

function parseIsoDateToUtcDate(dateOnly: string): Date {
    return new Date(`${dateOnly}T00:00:00Z`);
}

function safeHours(hoursWorked: number | null | undefined): number {
    if (typeof hoursWorked !== "number" || Number.isNaN(hoursWorked)) return 0;
    return hoursWorked;
}

export type Timeframe =
    | { kind: "all" }
    | { kind: "week"; weekNumber: number; weekBasedYear: number }
    | { kind: "month"; year: number; month: number } // month: 1-12
    | { kind: "year"; year: number };

export function normalizeTimeframe(
    tf: Timeframe,
    ref: Date = new Date()
): Exclude<Timeframe, { kind: "week"; weekNumber: number; weekBasedYear: number }> | Timeframe {
    if (tf.kind !== "week") return tf;
    if (Number.isFinite(tf.weekNumber) && Number.isFinite(tf.weekBasedYear)) return tf;
    const week = getIsoWeek(ref);
    return { kind: "week", ...week };
}

export function timeframeLabel(tf: Timeframe): string {
    switch (tf.kind) {
        case "all":
            return "All time";
        case "week":
            return `Week ${tf.weekNumber} (${tf.weekBasedYear})`;
        case "month":
            return `Month ${String(tf.month).padStart(2, "0")} (${tf.year})`;
        case "year":
            return `Year ${tf.year}`;
    }
}

export function timesheetMatchesTimeframe(t: TimesheetLike, tf: Timeframe): boolean {
    if (tf.kind === "all") return true;

    const date = parseIsoDateToUtcDate(t.dateOfIssue);
    if (tf.kind === "year") {
        return date.getUTCFullYear() === tf.year;
    }
    if (tf.kind === "month") {
        return date.getUTCFullYear() === tf.year && date.getUTCMonth() + 1 === tf.month;
    }
    const tWeek =
        t.weekNumber != null && t.weekBasedYear != null
            ? { weekNumber: t.weekNumber, weekBasedYear: t.weekBasedYear }
            : getIsoWeek(date);
    return tWeek.weekNumber === tf.weekNumber && tWeek.weekBasedYear === tf.weekBasedYear;
}

export function filterTimesheetsByTimeframe<T extends TimesheetLike>(timesheets: T[], tf: Timeframe): T[] {
    return timesheets.filter((t) => timesheetMatchesTimeframe(t, tf));
}

export function sumHours(timesheets: TimesheetLike[]): number {
    return timesheets.reduce((sum, t) => sum + safeHours(t.hoursWorked), 0);
}

export type TimeframeOptions = {
    weeks: IsoWeek[];
    months: { year: number; month: number }[];
    years: number[];
};

export function buildTimeframeOptions(timesheets: TimesheetLike[]): TimeframeOptions {
    const weekKeys = new Set<string>();
    const monthKeys = new Set<string>();
    const yearKeys = new Set<number>();

    for (const t of timesheets) {
        const date = parseIsoDateToUtcDate(t.dateOfIssue);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        yearKeys.add(year);
        monthKeys.add(`${year}-${month}`);

        const w =
            t.weekNumber != null && t.weekBasedYear != null
                ? { weekNumber: t.weekNumber, weekBasedYear: t.weekBasedYear }
                : getIsoWeek(date);
        weekKeys.add(`${w.weekBasedYear}-${w.weekNumber}`);
    }

    const weeks = [...weekKeys]
        .map((k) => {
            const [y, w] = k.split("-").map((x) => Number(x));
            return { weekBasedYear: y, weekNumber: w };
        })
        .sort((a, b) => (b.weekBasedYear - a.weekBasedYear) || (b.weekNumber - a.weekNumber));

    const months = [...monthKeys]
        .map((k) => {
            const [y, m] = k.split("-").map((x) => Number(x));
            return { year: y, month: m };
        })
        .sort((a, b) => (b.year - a.year) || (b.month - a.month));

    const years = [...yearKeys].sort((a, b) => b - a);

    return { weeks, months, years };
}

export type HoursSummary = {
    week: IsoWeek;
    month: { year: number; month: number }; // month: 1-12
    year: number;
    weekHours: number;
    monthHours: number;
    yearHours: number;
    totalHours: number;
};

export function summarizeHours(timesheets: TimesheetLike[], ref: Date = new Date()): HoursSummary {
    const nowUtc = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));
    const week = getIsoWeek(nowUtc);
    const year = nowUtc.getUTCFullYear();
    const month = { year, month: nowUtc.getUTCMonth() + 1 };

    let weekHours = 0;
    let monthHours = 0;
    let yearHours = 0;
    let totalHours = 0;

    for (const t of timesheets) {
        const hours = safeHours(t.hoursWorked);
        totalHours += hours;

        const date = parseIsoDateToUtcDate(t.dateOfIssue);
        const tYear = date.getUTCFullYear();
        const tMonth = date.getUTCMonth() + 1;

        if (tYear === year) yearHours += hours;
        if (tYear === month.year && tMonth === month.month) monthHours += hours;

        const tWeek =
            t.weekNumber != null && t.weekBasedYear != null
                ? { weekNumber: t.weekNumber, weekBasedYear: t.weekBasedYear }
                : getIsoWeek(date);
        if (tWeek.weekNumber === week.weekNumber && tWeek.weekBasedYear === week.weekBasedYear) {
            weekHours += hours;
        }
    }

    return { week, month, year, weekHours, monthHours, yearHours, totalHours };
}

export type UserHoursSummary = {
    userId: string;
    name: string;
    weekHours: number;
    monthHours: number;
    yearHours: number;
    totalHours: number;
};

export function summarizeHoursByUser(
    timesheets: TimesheetLike[],
    ref: Date = new Date()
): { week: IsoWeek; month: { year: number; month: number }; year: number; users: UserHoursSummary[] } {
    const { week, month, year } = summarizeHours([], ref);

    const buckets = new Map<string, { userId: string; name: string; items: TimesheetLike[] }>();
    for (const t of timesheets) {
        if (!t.userId) continue;
        const existing = buckets.get(t.userId);
        const name = t.name ?? existing?.name ?? t.userId;
        if (existing) {
            existing.items.push(t);
            existing.name = name;
        } else {
            buckets.set(t.userId, { userId: t.userId, name, items: [t] });
        }
    }

    const users: UserHoursSummary[] = [];
    for (const b of buckets.values()) {
        const summary = summarizeHours(b.items, ref);
        users.push({
            userId: b.userId,
            name: b.name,
            weekHours: summary.weekHours,
            monthHours: summary.monthHours,
            yearHours: summary.yearHours,
            totalHours: summary.totalHours,
        });
    }

    users.sort((a, b) => a.name.localeCompare(b.name));
    return { week, month, year, users };
}

export function sumHoursByUserForTimeframe(
    timesheets: TimesheetLike[],
    tf: Timeframe
): { users: UserHoursSummary[]; totalHours: number } {
    const filtered = filterTimesheetsByTimeframe(timesheets, tf);
    const buckets = new Map<string, { userId: string; name: string; hours: number }>();

    for (const t of filtered) {
        if (!t.userId) continue;
        const hours = safeHours(t.hoursWorked);
        const existing = buckets.get(t.userId);
        const name = t.name ?? existing?.name ?? t.userId;
        if (existing) {
            existing.hours += hours;
            existing.name = name;
        } else {
            buckets.set(t.userId, { userId: t.userId, name, hours });
        }
    }

    const users: UserHoursSummary[] = [...buckets.values()]
        .map((b) => ({
            userId: b.userId,
            name: b.name,
            weekHours: 0,
            monthHours: 0,
            yearHours: 0,
            totalHours: b.hours,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return { users, totalHours: sumHours(filtered) };
}
