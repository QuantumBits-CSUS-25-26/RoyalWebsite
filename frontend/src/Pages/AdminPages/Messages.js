import AdminSideBar from "../../Components/AdminSideBar";
import AuthErrorPage from "../../Components/AuthErrorPage/AuthErrorPage";

const Messages = () => {
  // determine authorization from stored user object
  const parseStoredUser = () => {
    try {
      const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const storedUser = parseStoredUser();

  const isAuthorized = (user) => {
    // if a token exists assume authenticated and allow; stored user may not be saved by login flow
    const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    if (!user && token) return true;
    if (!user) return false;
    if (user.is_employee || user.is_staff || user.is_admin || user.is_superuser) return true;
    if (user.role && (user.role === "employee" || user.role === "admin")) return true;
    if (Array.isArray(user.roles) && (user.roles.includes("employee") || user.roles.includes("admin"))) return true;
    return false;
  };

  if (!isAuthorized(storedUser)) return <AuthErrorPage />;

  return (
    <div>
      <AdminSideBar />
      <div className='messages'>Messages</div>
    </div>
  )
}

export default Messages