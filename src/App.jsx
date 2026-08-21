import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import SignUpPage from "./components/SignUpPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import DashboardPage from "./components/DashboardPage";
import MessagesPage from "./components/MessagesPage";
import ProfilePage from "./components/ProfilePage";
import ListingDetailPage from "./components/ListingDetailPage";
import ListingFormPage from "./components/ListingFormPage";

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
