import { Navigate } from 'react-router/dom';

const ProtectedRoute = ({ children }) => {
  const userData = localStorage.getItem('userData');

  if (!userData) {
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(userData);
  if (!user._id) {
    localStorage.removeItem('userData');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 