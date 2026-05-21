type ShiftActionMenuProps = {
    selectionCount: number;
    onPlan: () => void;
    onViewDetails: () => void;
    onViewSelected: () => void;
};

export default function ShiftActionMenu({
    selectionCount,
    onPlan,
    onViewDetails,
    onViewSelected,
}: ShiftActionMenuProps) {
    return (
        <div className="planningShiftPopoverMenu" role="menu" aria-label="Shift actions menu">
            <button type="button" className="planningShiftPopoverItem" role="menuitem" onClick={onPlan}>
                Plan someone in
            </button>
            {selectionCount === 1 ? (
                <button type="button" className="planningShiftPopoverItem" role="menuitem" onClick={onViewDetails}>
                    View shift details
                </button>
            ) : (
                <button type="button" className="planningShiftPopoverItem" role="menuitem" onClick={onViewSelected}>
                    View selected shifts
                </button>
            )}
        </div>
    );
}

