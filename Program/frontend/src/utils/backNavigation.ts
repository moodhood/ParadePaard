import type { NavigateFunction } from "react-router-dom";

export function goBackOrFallback(navigate: NavigateFunction, fallbackTo = "/dashboard") {
    if (typeof window !== "undefined" && window.history.length > 1) {
        navigate(-1);
        return;
    }

    navigate(fallbackTo);
}
