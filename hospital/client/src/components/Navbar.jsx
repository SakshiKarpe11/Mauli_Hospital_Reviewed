
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="top-navbar">

      {/* Hospital Name */}
      <div className="navbar-left">
        <h2>Mauli Hospital</h2>
      </div>

      {/* Right Side */}
      <div className="navbar-right">

        <div className="navbar-user">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="user-info">
            <strong>
              {user.name || "Hospital User"}
            </strong>

            <span>
              {user.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : "User"}
            </span>
          </div>
        </div>

        <button
          className="navbar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </header>
  );
}

export default Navbar;
