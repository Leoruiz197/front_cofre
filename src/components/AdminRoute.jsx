import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = sessionStorage.getItem("token");
  const adminData = sessionStorage.getItem("admin");

  let admin = null;

  try {
    admin = adminData ? JSON.parse(adminData) : null;
  } catch (error) {
    sessionStorage.clear();
    return <Navigate to="/admin/login" replace />;
  }

  if (!token || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminRoute;