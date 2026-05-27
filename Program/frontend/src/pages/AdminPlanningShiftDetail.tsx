import { Navigate, useParams } from "react-router-dom";

export default function AdminPlanningShiftDetail() {
    const { projectId, eventId, shiftId } = useParams<{ projectId?: string; eventId?: string; shiftId?: string }>();
    const resolvedProjectId = projectId ?? eventId;

    if (!resolvedProjectId) {
        return <Navigate to="/management/planning" replace />;
    }

    const target = shiftId
        ? `/management/planning/projects/${resolvedProjectId}?shift=${shiftId}`
        : `/management/planning/projects/${resolvedProjectId}`;

    return <Navigate to={target} replace />;
}
