import { Navigate } from 'react-router-dom'

const AdminAuthWrapper = ({ children, path = '/dashboard', notUser = true }) => {
    const user = JSON.parse(localStorage.getItem('adminData'));
    if (notUser) {
        if (!user) return <Navigate to="/admin/login" replace />;
    // if (path === '/') return <Navigate to={`/dashboard/${user.id}`} replace />;
    } else {
        if (user) return <Navigate to={`/admin/${user.fullname}`} replace />;
    // if (path === '/') return <Navigate to="/" replace />;
    }
    return children;
}
 
export default AdminAuthWrapper;