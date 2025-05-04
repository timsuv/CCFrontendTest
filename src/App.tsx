import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./components/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Stripe from "./components/Stripe";
import CoursesPage from "./pages/CoursePages";
// const Dashboard = () => (
//   <div className="p-4">
//     <h1>Dashboard</h1>
//     <p>You're logged in!</p>
//     <LogoutButton />


//   </div>
// );


function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/search" element={<CoursesPage />} />

            <Route path="/pay" element={<Stripe />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
