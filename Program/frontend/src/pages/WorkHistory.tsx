import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import Card from "../components/common/Card";
import { UserServices } from "../services/user-service/UserServices";
import "../stylesheets/WorkHistory.css";
import {
    buildTimeframeOptions,
    filterTimesheetsByTimeframe,
    getIsoWeek,
    sumHours,
    timeframeLabel,
    type Timeframe,
} from "../utils/hoursSummary";

export interface Timesheet {
    timesheetId: string;
    dateOfIssue: string;
    function: string;
    hoursWorked: number;
}

export default function WorkHistory() {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const timeframeOptions = useMemo(() => buildTimeframeOptions(timesheets), [timesheets]);
    const [timeframe, setTimeframe] = useState<Timeframe>({ kind: "all" });
    const [timeframeInitialized, setTimeframeInitialized] = useState(false);
    const yearOptions = useMemo(() => {
        const nowYear = new Date().getFullYear();
        const years = new Set<number>(timeframeOptions.years);
        years.add(nowYear);
        for (let i = 1; i <= 5; i++) years.add(nowYear - i);
        return [...years].sort((a, b) => b - a);
    }, [timeframeOptions.years]);

    useEffect(() => {
        if (timeframeInitialized) return;
        if (timesheets.length === 0) return;
        if (timeframeOptions.weeks.length > 0) {
            const latest = timeframeOptions.weeks[0];
            setTimeframe({ kind: "week", ...latest });
            setTimeframeInitialized(true);
        } else if (timeframeOptions.months.length > 0) {
            const latest = timeframeOptions.months[0];
            setTimeframe({ kind: "month", ...latest });
            setTimeframeInitialized(true);
        } else if (timeframeOptions.years.length > 0) {
            setTimeframe({ kind: "year", year: timeframeOptions.years[0] });
            setTimeframeInitialized(true);
        }
    }, [timeframeInitialized, timeframeOptions.months, timeframeOptions.weeks, timeframeOptions.years, timesheets.length]);

    const filteredTimesheets = useMemo(() => {
        const filtered = filterTimesheetsByTimeframe(timesheets, timeframe);
        return [...filtered].sort((a, b) => (b.dateOfIssue ?? "").localeCompare(a.dateOfIssue ?? ""));
    }, [timesheets, timeframe]);
    const totalHours = useMemo(() => sumHours(filteredTimesheets), [filteredTimesheets]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setErrorMsg(null);
                const data = await UserServices.getMyTimesheets();
                if (!cancelled) setTimesheets(data);
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : "Failed to load work history";
                if (!cancelled) setErrorMsg(message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            <Navbar />
            <div className="workHistoryPage">
                <div className="workHistoryShell">
                    <header className="workHistoryHeader">
                        <h1 className="workHistoryTitle">Work History</h1>
                        <p className="workHistorySubtitle">
                            A record of your past shifts and hours.
                        </p>
                    </header>

                    {loading ? (
                        <div className="workHistoryLoading">
                            <Spinner text="Loading work history" />
                        </div>
                    ) : errorMsg ? (
                        <div className="workHistoryError">{errorMsg}</div>
                    ) : (
                        <Card
                            title={`Timesheets (${timeframeLabel(timeframe)})`}
                            className="workHistoryCard"
                            right={
                                <div className="workHistoryFilters">
                                    <select
                                        className="workHistorySelect"
                                        value={timeframe.kind}
                                        onChange={(e) => {
                                            const kind = e.target.value as Timeframe["kind"];
                                            if (kind === "all") setTimeframe({ kind });
                                            if (kind === "week") {
                                                const latest = timeframeOptions.weeks[0];
                                                const fallback = getIsoWeek(new Date());
                                                setTimeframe(latest ? { kind, ...latest } : { kind, ...fallback });
                                            }
                                            if (kind === "month") {
                                                const latest = timeframeOptions.months[0];
                                                const now = new Date();
                                                setTimeframe(
                                                    latest ? { kind, ...latest } : { kind, year: now.getFullYear(), month: now.getMonth() + 1 }
                                                );
                                            }
                                            if (kind === "year") {
                                                const latest = timeframeOptions.years[0];
                                                const nowYear = new Date().getFullYear();
                                                setTimeframe(typeof latest === "number" ? { kind, year: latest } : { kind, year: nowYear });
                                            }
                                        }}
                                        disabled={timesheets.length === 0}
                                        aria-label="Select timeframe type"
                                    >
                                        <option value="week">Week</option>
                                        <option value="month">Month</option>
                                        <option value="year">Year</option>
                                        <option value="all">All</option>
                                    </select>

                                    {timeframe.kind === "week" ? (
                                        <>
                                            <select
                                                className="workHistorySelect"
                                                value={String(timeframe.weekBasedYear)}
                                                onChange={(e) =>
                                                    setTimeframe({
                                                        kind: "week",
                                                        weekBasedYear: Number(e.target.value),
                                                        weekNumber: timeframe.weekNumber,
                                                    })
                                                }
                                                aria-label="Select week-based year"
                                            >
                                                {yearOptions.map((y) => (
                                                    <option key={y} value={String(y)}>
                                                        {y}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                className="workHistorySelect"
                                                value={String(timeframe.weekNumber)}
                                                onChange={(e) =>
                                                    setTimeframe({
                                                        kind: "week",
                                                        weekBasedYear: timeframe.weekBasedYear,
                                                        weekNumber: Number(e.target.value),
                                                    })
                                                }
                                                aria-label="Select week number"
                                            >
                                                {Array.from({ length: 53 }, (_, i) => i + 1).map((w) => (
                                                    <option key={w} value={String(w)}>
                                                        Week {w}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    ) : null}

                                    {timeframe.kind === "month" ? (
                                        <>
                                            <select
                                                className="workHistorySelect"
                                                value={String(timeframe.year)}
                                                onChange={(e) =>
                                                    setTimeframe({ kind: "month", year: Number(e.target.value), month: timeframe.month })
                                                }
                                                aria-label="Select year"
                                            >
                                                {yearOptions.map((y) => (
                                                    <option key={y} value={String(y)}>
                                                        {y}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                className="workHistorySelect"
                                                value={String(timeframe.month)}
                                                onChange={(e) =>
                                                    setTimeframe({ kind: "month", year: timeframe.year, month: Number(e.target.value) })
                                                }
                                                aria-label="Select month"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                    <option key={m} value={String(m)}>
                                                        Month {String(m).padStart(2, "0")}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    ) : null}

                                    {timeframe.kind === "year" ? (
                                        <select
                                            className="workHistorySelect"
                                            value={String(timeframe.year)}
                                            onChange={(e) => setTimeframe({ kind: "year", year: Number(e.target.value) })}
                                            aria-label="Select year"
                                        >
                                            {yearOptions.map((y) => (
                                                <option key={y} value={String(y)}>
                                                    Year {y}
                                                </option>
                                            ))}
                                        </select>
                                    ) : null}
                                </div>
                            }
                        >
                            <div className="workHistoryTableWrap">
                                <table className="workHistoryTable">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Function</th>
                                            <th className="workHistoryHoursCol">Hours Worked</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTimesheets.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="workHistoryEmpty">
                                                    No timesheets found for {timeframeLabel(timeframe)}.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTimesheets.map((t) => (
                                                <tr key={t.timesheetId}>
                                                    <td>{t.dateOfIssue}</td>
                                                    <td>{t.function}</td>
                                                    <td className="workHistoryHoursCol">{t.hoursWorked.toFixed(1)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="workHistoryTotalRow">
                                            <td colSpan={2}>Total</td>
                                            <td className="workHistoryHoursCol">{totalHours.toFixed(1)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
