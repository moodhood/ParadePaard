import { Navigate, useParams } from "react-router-dom";

export default function AdminPlanningShiftDetail() {
    const { eventId, shiftId } = useParams<{ eventId: string; shiftId: string }>();

    if (!eventId) {
        return <Navigate to="/management/planning" replace />;
    }

    const target = shiftId
        ? `/management/planning/projects/${eventId}?shift=${shiftId}`
        : `/management/planning/projects/${eventId}`;

    return <Navigate to={target} replace />;
}
