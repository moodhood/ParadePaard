import { Navigate, useParams } from "react-router-dom";

export default function AdminPlanningShiftDetail() {
    const { eventId, shiftId } = useParams<{ eventId: string; shiftId: string }>();

    if (!eventId) {
        return <Navigate to="/management/planning" replace />;
    }

    const target = shiftId
        ? `/management/planning/events/${eventId}?shift=${shiftId}`
        : `/management/planning/events/${eventId}`;

    return <Navigate to={target} replace />;
}
