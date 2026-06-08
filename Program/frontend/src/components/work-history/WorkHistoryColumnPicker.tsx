import { useEffect, useId, useRef, useState } from "react";
import type { WorkHistoryColumn, WorkHistoryColumnKey } from "../../utils/workHistoryColumns";

type WorkHistoryColumnPickerProps = {
    availableColumns: readonly WorkHistoryColumn[];
    visibleColumns: readonly WorkHistoryColumnKey[];
    onToggleColumn: (columnKey: WorkHistoryColumnKey) => void;
    defaultOpen?: boolean;
};

export function formatWorkHistoryColumnPickerSummary(
    visibleColumns: readonly WorkHistoryColumnKey[],
    availableColumns: readonly WorkHistoryColumn[]
): { countLabel: string; previewLabel: string } {
    const selectedColumns = availableColumns.filter((column) => visibleColumns.includes(column.key));
    const previewColumns = selectedColumns.slice(0, 3).map((column) => column.label);

    return {
        countLabel: `${selectedColumns.length} visible`,
        previewLabel:
            selectedColumns.length > 3
                ? `${previewColumns.join(", ")} +${selectedColumns.length - 3} more`
                : previewColumns.join(", "),
    };
}

export function WorkHistoryColumnPicker({
    availableColumns,
    visibleColumns,
    onToggleColumn,
    defaultOpen = false,
}: WorkHistoryColumnPickerProps) {
    const [open, setOpen] = useState(defaultOpen);
    const [popoverPlacement, setPopoverPlacement] = useState<"below" | "above">("below");
    const [popoverMaxHeight, setPopoverMaxHeight] = useState<number | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const popoverId = useId();
    const summary = formatWorkHistoryColumnPickerSummary(visibleColumns, availableColumns);

    useEffect(() => {
        if (!open) return;

        const updatePopoverLayout = () => {
            const root = rootRef.current;
            const popover = popoverRef.current;
            if (!root || !popover) {
                return;
            }

            const gap = 8;
            const safeMargin = 16;
            const rootRect = root.getBoundingClientRect();
            const measuredHeight = popover.scrollHeight;
            const availableBelow = window.innerHeight - rootRect.bottom - gap - safeMargin;
            const availableAbove = rootRect.top - gap - safeMargin;
            const shouldOpenAbove = availableBelow < Math.min(measuredHeight, 320) && availableAbove > availableBelow;
            const availableSpace = shouldOpenAbove ? availableAbove : availableBelow;
            const cappedHeight = availableSpace <= 0
                ? measuredHeight
                : availableSpace < 160
                    ? availableSpace
                    : Math.min(measuredHeight, availableSpace);

            setPopoverPlacement(shouldOpenAbove ? "above" : "below");
            setPopoverMaxHeight(Math.round(cappedHeight));
        };

        updatePopoverLayout();

        const handlePointerDown = (event: MouseEvent) => {
            if (!(event.target instanceof Node)) return;
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        window.addEventListener("resize", updatePopoverLayout);
        window.addEventListener("scroll", updatePopoverLayout, true);
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("resize", updatePopoverLayout);
            window.removeEventListener("scroll", updatePopoverLayout, true);
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    return (
        <div className="workHistoryColumnPicker" ref={rootRef}>
            <button
                type="button"
                className="workHistoryColumnPickerButton"
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-controls={popoverId}
                onClick={() => setOpen((current) => !current)}
            >
                <span className="workHistoryColumnPickerLabel">Selected columns</span>
                <strong className="workHistoryColumnPickerValue">{summary.countLabel}</strong>
                <span className="workHistoryColumnPickerPreview">{summary.previewLabel}</span>
                <span className="workHistoryColumnPickerCaret" aria-hidden="true">
                    {open ? "^" : "v"}
                </span>
            </button>
            {open ? (
                <div
                    id={popoverId}
                    ref={popoverRef}
                    className={`workHistoryColumnPopover${
                        popoverPlacement === "above" ? " workHistoryColumnPopover--above" : ""
                    }`}
                    role="dialog"
                    aria-label="Choose visible work history columns"
                    style={popoverMaxHeight == null ? undefined : { maxHeight: `${popoverMaxHeight}px` }}
                >
                    <div className="workHistoryColumnPopoverHeader">
                        <div className="workHistoryColumnPopoverCopy">
                            <strong>Choose visible columns</strong>
                            <span>Finance columns are only available to users with payroll finance permission.</span>
                        </div>
                        <button
                            type="button"
                            className="workHistoryColumnPopoverDone"
                            onClick={() => setOpen(false)}
                        >
                            Done
                        </button>
                    </div>
                    <div className="workHistoryColumnOptions">
                        {availableColumns.map((column) => (
                            <label
                                key={column.key}
                                className={column.financeOnly ? "workHistoryColumnOption--finance" : ""}
                            >
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.includes(column.key)}
                                    onChange={() => onToggleColumn(column.key)}
                                />
                                <span>{column.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
