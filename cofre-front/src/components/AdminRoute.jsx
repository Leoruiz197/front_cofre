import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = sessionStorage.getItem("token");
  const adminData = sessionStorage.getItem("admin");

  try {
    if (adminData) {
      JSON.parse(adminData);
    }
  } catch {
    sessionStorage.clear();
    return <Navigate to="/admin/login" replace />;
  }

  if (!token || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminRoute;