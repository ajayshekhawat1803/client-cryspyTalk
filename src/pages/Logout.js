import { toast } from "react-toastify";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => {
        // Perform logout logic here
        console.log("User logged out");
        dispatch(logout({}));
        toast.success("Logout successful");
        // Redirect to login page or home page  
        navigate("/login");
    };

    return (
        <div>
            <h1>Logout</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
export default Logout;