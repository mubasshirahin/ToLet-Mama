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
import AppLayout from "./components/AppLayout";
import { ThemeProvider } from "./theme/ThemeProvider";
import SceneCanvas from "./components/3d/SceneCanvas";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="relative min-h-screen">
          <SceneCanvas />
          <Routes>
            {/* Public pages — no sidebar/navbar */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated pages — always show Navbar + Sidebar */}
            <Route
              path="/dashboard"
              element={<AppLayout><DashboardPage /></AppLayout>}
            />
            <Route
              path="/messages"
              element={<AppLayout><MessagesPage /></AppLayout>}
            />
            <Route
              path="/profile"
              element={<AppLayout><ProfilePage /></AppLayout>}
            />
            <Route
              path="/listings/new"
              element={<AppLayout><ListingFormPage /></AppLayout>}
            />
            <Route
              path="/listings/:id/edit"
              element={<AppLayout><ListingFormPage /></AppLayout>}
            />
            <Route
              path="/listings/:id"
              element={<AppLayout><ListingDetailPage /></AppLayout>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
