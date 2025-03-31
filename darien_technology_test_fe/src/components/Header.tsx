import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Reservation System
        </Link>

        {isAuthenticated && user ? (
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.name}</span>
            <button
              onClick={logout}
              className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-x-2">
            <Link
              to="/login"
              className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-transparent border border-white text-white px-3 py-1 rounded hover:bg-white hover:text-blue-600 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
