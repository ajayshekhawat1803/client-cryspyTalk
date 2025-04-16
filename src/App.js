import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Logout from "./pages/Logout";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes: accessible only if not logged in */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected route: only accessible if logged in */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>}  />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
