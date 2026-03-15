import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role') || 'guest'; 
    const loginPath = location.pathname.includes('/digital') ? '/digital' : '/';
    if (!token) {
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        const homePath = location.pathname.includes('/digital') ? '/digital' : '/';
        return <Navigate to={homePath} replace />;
    }
    return <Outlet />;
};

export default ProtectedRoute;