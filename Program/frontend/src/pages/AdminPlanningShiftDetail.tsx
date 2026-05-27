import { Navigate, useParams } from "react-router-dom";

export default function AdminPlanningShiftDetail() {
    const { projectId, shiftId } = useParams<{ projectId: string; shiftId: string }>();

    if (!projectId) {
        return <Navigate to="/management/planning" replace />;
    }

    const target = shiftId
        ? `/management/planning/projects/${projectId}?shift=${shiftId}`
        : `/management/planning/projects/${projectId}`;

    return <Navigate to={target} replace />;
}
