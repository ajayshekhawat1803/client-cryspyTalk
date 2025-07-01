import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import LoaderComponent from "./components/loader";
import "./App.css";
import ChatArea from "./components/chats/ChatArea";
import socket from "./socket/socket";
import { SOCKET_EVENTS } from "./socket/socketEvents";
import { useEffect } from "react";

function App() {
  const loading = useSelector((state) => state.loader.loading);
  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  if (user && currentUserId) {
    socket.emit(SOCKET_EVENTS.USER.CONNECTED, { userId: currentUserId });
  }
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#121212' : '#f8f9fa';
    document.body.style.color = theme === 'dark' ? '#f1f1f1' : '#000';
  }, [theme]);
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
      </Routes>
    </BrowserRouter>
  )
}

export default App;
