import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Logout from "./pages/Logout";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import LoaderComponent from "./components/loader";
import "./App.css";
import ChatArea from "./components/chats/ChatArea";
import socket from "./socket/socket";
import { SOCKET_EVENTS } from "./socket/socketEvents";

function App() {
  const loading = useSelector((state) => state.loader.loading);
  const { user } = useSelector((state) => state.auth);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  if (user && currentUserId) {
    socket.emit(SOCKET_EVENTS.USER.CONNECTED, currentUserId);
  }
  return (
    <BrowserRouter>
      <ToastContainer style={{ zIndex: 99999999 }} />
      {loading && <LoaderComponent />}
      <Routes>
        {/* Public routes: accessible only if not logged in */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected route: only accessible if logged in */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute><ChatArea /></ProtectedRoute>} />
        <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
