import "./AuthErrorPage.css";
import { Link } from "react-router-dom";

const AuthErrorPage = () => {
  return (
    <div className="auth-error-page">
      <h1>403 - Forbidden</h1>
      <p>Sorry, you do not have permission to access this page.</p>
      <Link to="/">Go back to Home</Link>
    </div>
  );
};

export default AuthErrorPage;