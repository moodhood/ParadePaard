import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ShiftActionMenu from "./ShiftActionMenu";

describe("ShiftActionMenu", () => {
    it("shows View shift details for single selection", () => {
        const html = renderToStaticMarkup(
            <ShiftActionMenu
                selectionCount={1}
                onPlan={() => undefined}
                onViewDetails={() => undefined}
                onViewSelected={() => undefined}
            />
        );

        expect(html).toContain("Plan someone in");
        expect(html).toContain("View shift details");
        expect(html).not.toContain("View selected shifts");
    });

    it("shows View selected shifts for multi selection", () => {
        const html = renderToStaticMarkup(
            <ShiftActionMenu
                selectionCount={2}
                onPlan={() => undefined}
                onViewDetails={() => undefined}
                onViewSelected={() => undefined}
            />
        );

        expect(html).toContain("Plan someone in");
        expect(html).toContain("View selected shifts");
        expect(html).not.toContain("View shift details");
    });
});

