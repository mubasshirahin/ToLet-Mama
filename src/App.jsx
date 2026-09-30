import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import SignUpPage from "./components/SignUpPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import DashboardPage from "./components/DashboardPage";
import MyListingsPage from "./components/MyListingsPage";
import MessagesPage from "./components/MessagesPage";
import ProfilePage from "./components/ProfilePage";
import ListingDetailPage from "./components/ListingDetailPage";
import ListingFormPage from "./components/ListingFormPage";
import SavedPage from "./components/SavedPage";
import HelpCenterPage from "./components/HelpCenterPage";
import GuidelinesPage from "./components/GuidelinesPage";
import AboutPage from "./components/AboutPage";
import NotFoundPage from "./components/NotFoundPage";
import AppLayout from "./components/AppLayout";
import { ThemeProvider } from "./theme/ThemeProvider";
import SceneCanvas from "./components/3d/SceneCanvas";
import NotificationsPage from "./components/NotificationsPage";
import { LanguageProvider } from "./theme/LanguageProvider";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
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
              path="/my-listings"
              element={<AppLayout><MyListingsPage /></AppLayout>}
            />
            <Route
              path="/messages"
              element={<AppLayout><MessagesPage /></AppLayout>}
            />
            <Route
              path="/saved"
              element={<AppLayout><SavedPage /></AppLayout>}
            />
            <Route
              path="/profile"
              element={<AppLayout><ProfilePage /></AppLayout>}
            />
            <Route
              path="/help"
              element={<AppLayout><HelpCenterPage /></AppLayout>}
            />
            <Route
              path="/guidelines"
              element={<AppLayout><GuidelinesPage /></AppLayout>}
            />
            <Route
              path="/about"
              element={<AppLayout><AboutPage /></AppLayout>}
            />
            <Route path="/notifications" element={<AppLayout><NotificationsPage /></AppLayout>} />
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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
