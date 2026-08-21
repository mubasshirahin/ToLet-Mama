import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import SignUpPage from "./components/SignUpPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import DashboardPage from "./components/DashboardPage";
import MessagesPage from "./components/MessagesPage";
import ProfilePage from "./components/ProfilePage";
import ListingDetailPage from "./components/ListingDetailPage";
import ListingFormPage from "./components/ListingFormPage";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./theme/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="relative min-h-screen">
          <ThemeToggleDock />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/listings/new" element={<ListingFormPage />} />
            <Route path="/listings/:id/edit" element={<ListingFormPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function ThemeToggleDock() {
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/dashboard") {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[60] sm:right-6 sm:top-6">
      <ThemeToggle compact />
    </div>
  );
}

export default App;
