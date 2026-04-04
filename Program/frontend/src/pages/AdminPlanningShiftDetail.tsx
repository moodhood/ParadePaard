import { Navigate, useParams } from "react-router-dom";

export default function AdminPlanningShiftDetail() {
    const { eventId, shiftId } = useParams<{ eventId: string; shiftId: string }>();

    if (!eventId) {
        return <Navigate to="/admin/planning" replace />;
    }

    const target = shiftId
        ? `/admin/planning/events/${eventId}?shift=${shiftId}`
        : `/admin/planning/events/${eventId}`;

    return <Navigate to={target} replace />;
}
