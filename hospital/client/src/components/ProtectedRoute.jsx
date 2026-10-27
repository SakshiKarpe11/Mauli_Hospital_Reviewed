import { Navigate } from "react-router-dom";

function getHomeForRole(role) {
    if (role === "admin") return "/";
    if (role === "doctor") return "/doctor-dashboard";
    if (role === "patient") return "/patient-dashboard";
    return "/login";
}

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
        return <Navigate to="/login" replace />;
    }

    let user;
    try {
        user = JSON.parse(userData);
    } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={getHomeForRole(user.role)} replace />;
    }

    return children;
}

export default ProtectedRoute;
