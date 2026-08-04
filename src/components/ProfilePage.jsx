import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Phone,
  SwitchCamera,
  User,
  X,
  AlertCircle,
} from "lucide-react";

const ROLES = {
  STUDENT: "Student",
  OWNER: "Owner",
};

const DEFAULT_PROFILE = {
  [ROLES.STUDENT]: {
    name: "Rafsan Islam",
    email: "rafsan.islam@example.com",
    phone: "+880 1712 345678",
    city: "Dhaka",
    bio: "Searching for a calm room near campus with flexible rent and reliable utilities.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop",
  },
  [ROLES.OWNER]: {
    name: "Sharmin Akhter",
    email: "sharmin.akhter@example.com",
    phone: "+880 1811 223344",
    city: "Dhaka",
    bio: "Managing student-friendly homes across the city with quick replies and transparent listings.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop",
  },
};

function createProfileState(role) {
  return {
    ...DEFAULT_PROFILE[role],
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

function ProfilePage() {
  const location = useLocation();
  const fileInputRef = useRef(null);

  const initialRole = location.state?.role || ROLES.STUDENT;
  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState(createProfileState(initialRole));
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_PROFILE[initialRole].avatar);
  const [uploadName, setUploadName] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [pendingRole, setPendingRole] = useState(null);

  const avatarFallback = useMemo(() => {
    const initials = formData.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

    return initials || "TL";
  }, [formData.name]);

  const pushToast = (type, text) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { id, type, text }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (formData.phone.trim() && formData.phone.trim().length < 8) {
      nextErrors.phone = "Phone number looks too short.";
    }

    const passwordFieldsFilled =
      formData.currentPassword || formData.newPassword || formData.confirmPassword;
    if (passwordFieldsFilled) {
      if (!formData.currentPassword) {
        nextErrors.currentPassword = "Current password is required.";
      }
      if (!formData.newPassword) {
        nextErrors.newPassword = "New password is required.";
      } else if (formData.newPassword.length < 6) {
        nextErrors.newPassword = "Password must be at least 6 characters.";
      }
      if (!formData.confirmPassword) {
        nextErrors.confirmPassword = "Please confirm the new password.";
      } else if (formData.newPassword !== formData.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const handleAvatarSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      pushToast("error", "Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(String(reader.result));
      setUploadName(file.name);
      pushToast("success", "Avatar preview updated.");
    };
    reader.readAsDataURL(file);
  };

  const requestRoleSwitch = (nextRole) => {
    if (nextRole === role) return;
    setPendingRole(nextRole);
  };

  const confirmRoleSwitch = () => {
    if (!pendingRole) return;
    setRole(pendingRole);
    setFormData(createProfileState(pendingRole));
    setAvatarPreview(DEFAULT_PROFILE[pendingRole].avatar);
    setUploadName("");
    setErrors({});
    setPendingRole(null);
    pushToast("success", `Switched to ${pendingRole} profile.`);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validate()) {
      pushToast("error", "Please fix the highlighted fields.");
      return;
    }

    setIsSaving(true);
    try {
      await new Promise((resolve, reject) =>
        window.setTimeout(() => (Math.random() > 0.14 ? resolve() : reject(new Error("Network error"))), 1200)
      );

      setFormData((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      pushToast("success", "Profile changes saved.");
    } catch {
      pushToast("error", "We could not save the profile right now.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setRole(initialRole);
    setFormData(createProfileState(initialRole));
    setAvatarPreview(DEFAULT_PROFILE[initialRole].avatar);
  }, [initialRole]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF3E0] text-[#2C1810]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,58,33,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(44,24,16,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.5),transparent_18%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex flex-col gap-4 border-2 border-[#5C3A21]/20 bg-white/85 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <Link
              to="/dashboard"
              state={{ role }}
              className="mb-3 inline-flex items-center gap-2 font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880] transition-colors hover:text-[#2C1810]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Back to dashboard
            </Link>
            <h1 className="font-serif text-3xl font-black tracking-tight text-[#2C1810] sm:text-4xl">
              User Profile
            </h1>
            <p className="mt-1 max-w-2xl font-serif text-sm text-[#5C3A21]">
              Update your personal details, upload a new photo, and switch between student and owner modes from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border-2 border-[#2C1810] bg-[#FAF3E0] px-3 py-2 font-serif text-xs font-bold uppercase tracking-[0.15em]">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              {role} account
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-coupon-clip px-4 py-2 text-[10px]"
            >
              <Camera className="h-4 w-4" strokeWidth={1.8} />
              Upload avatar
            </button>
          </div>
        </motion.header>

        <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="space-y-6"
          >
            <div className="border-2 border-[#5C3A21]/20 bg-white p-5 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4 border-b-2 border-[#2C1810] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-black tracking-tight text-[#2C1810]">
                    Profile Details
                  </h2>
                  <p className="font-serif text-sm text-[#5C3A21]">
                    Edit your public identity and contact information.
                  </p>
                </div>
                <div className="hidden rounded-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-1 font-serif text-[10px] uppercase tracking-[0.2em] text-[#A89880] sm:block">
                  Auto-save disabled
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                <div className="flex flex-col items-center gap-4">
                  <div className="halftone-overlay relative h-40 w-40 overflow-hidden border-2 border-[#2C1810] bg-[#F4E8C1] shadow-[6px_6px_0px_rgba(44,24,16,0.08)]">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-serif text-5xl font-black text-[#2C1810]">
                        {avatarFallback}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C1810]/80 to-transparent px-3 py-2 text-center font-serif text-[10px] font-bold uppercase tracking-[0.15em] text-[#FAF3E0]">
                      Preview
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 font-serif text-xs font-bold uppercase tracking-[0.14em] text-[#5C3A21] transition-colors hover:text-[#2C1810]"
                  >
                    <SwitchCamera className="h-4 w-4" strokeWidth={1.8} />
                    Change photo
                  </button>

                  <p className="max-w-[180px] text-center font-serif text-[11px] leading-relaxed text-[#A89880]">
                    {uploadName || "PNG, JPG, or WEBP up to a few MB works best."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    icon={User}
                    value={formData.name}
                    onChange={(value) => handleChange("name", value)}
                    error={errors.name}
                    placeholder="Your full name"
                  />
                  <Field
                    label="Email Address"
                    icon={Mail}
                    value={formData.email}
                    onChange={(value) => handleChange("email", value)}
                    error={errors.email}
                    placeholder="you@example.com"
                    type="email"
                  />
                  <Field
                    label="Phone Number"
                    icon={Phone}
                    value={formData.phone}
                    onChange={(value) => handleChange("phone", value)}
                    error={errors.phone}
                    placeholder="+880 1..."
                  />
                  <Field
                    label="City"
                    icon={MapPin}
                    value={formData.city}
                    onChange={(value) => handleChange("city", value)}
                    placeholder="Dhaka"
                  />
                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      rows={4}
                      className="vintage-inset w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none transition-colors focus:border-[#2C1810]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-[#5C3A21]/20 bg-white p-5 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:p-6">
              <div className="mb-5 border-b-2 border-[#2C1810] pb-4">
                <h2 className="font-serif text-xl font-black tracking-tight text-[#2C1810]">
                  Security
                </h2>
                <p className="font-serif text-sm text-[#5C3A21]">
                  Update your password only when you are ready to change it.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField
                  label="Current Password"
                  value={formData.currentPassword}
                  onChange={(value) => handleChange("currentPassword", value)}
                  error={errors.currentPassword}
                  visible={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword((current) => !current)}
                />
                <PasswordField
                  label="New Password"
                  value={formData.newPassword}
                  onChange={(value) => handleChange("newPassword", value)}
                  error={errors.newPassword}
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((current) => !current)}
                />
                <PasswordField
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(value) => handleChange("confirmPassword", value)}
                  error={errors.confirmPassword}
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((current) => !current)}
                  className="sm:col-span-2"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 border-2 border-[#5C3A21]/20 bg-white p-5 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-serif text-xl font-black tracking-tight text-[#2C1810]">
                  Save Changes
                </h2>
                <p className="font-serif text-sm text-[#5C3A21]">
                  We&apos;ll keep the page open and confirm once your updates are applied.
                </p>
              </div>
              <motion.button
                type="submit"
                disabled={isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-rubber-stamp justify-center px-6 py-3 text-sm disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save profile"}
              </motion.button>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="space-y-6"
          >
            <div className="border-2 border-[#5C3A21]/20 bg-white p-5 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:p-6">
              <div className="mb-5 border-b-2 border-[#2C1810] pb-4">
                <h2 className="font-serif text-xl font-black tracking-tight text-[#2C1810]">
                  Role Management
                </h2>
                <p className="font-serif text-sm text-[#5C3A21]">
                  Switching role updates the dashboard context and saved defaults.
                </p>
              </div>

              <div className="grid grid-cols-2 border-2 border-[#2C1810]">
                {[ROLES.STUDENT, ROLES.OWNER].map((nextRole) => (
                  <button
                    key={nextRole}
                    type="button"
                    onClick={() => requestRoleSwitch(nextRole)}
                    className={`px-4 py-3 font-serif text-xs font-bold uppercase tracking-[0.15em] transition-all ${
                      role === nextRole
                        ? "bg-[#2C1810] text-[#FAF3E0]"
                        : "bg-transparent text-[#5C3A21] hover:bg-[#F4E8C1]"
                    }`}
                  >
                    {nextRole}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3 font-serif text-sm text-[#5C3A21]">
                <div className="flex items-center justify-between border-b border-[#5C3A21]/10 pb-2">
                  <span className="uppercase tracking-[0.14em] text-[10px] text-[#A89880]">
                    Active role
                  </span>
                  <span className="font-bold text-[#2C1810]">{role}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#5C3A21]/10 pb-2">
                  <span className="uppercase tracking-[0.14em] text-[10px] text-[#A89880]">
                    Current city
                  </span>
                  <span className="font-bold text-[#2C1810]">{formData.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-[0.14em] text-[10px] text-[#A89880]">
                    Avatar status
                  </span>
                  <span className="font-bold text-[#2C1810]">
                    {uploadName ? "Updated" : "Default"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-2 border-[#5C3A21]/20 bg-[#2C1810] p-5 text-[#FAF3E0] shadow-[4px_4px_0px_rgba(44,24,16,0.1)] sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-[#FAF3E0]/30 bg-[#FAF3E0]/10">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-black tracking-tight">
                    Safety checklist
                  </h3>
                  <p className="font-serif text-sm text-[#F4E8C1]/80">
                    A quick reminder while you edit sensitive account settings.
                  </p>
                </div>
              </div>

              <ul className="space-y-3 font-serif text-sm leading-relaxed text-[#F4E8C1]">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                  Use a unique password that is not shared with other sites.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                  Upload a clear avatar so landlords and students can recognize you faster.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                  Switch roles only when your profile details match the active account type.
                </li>
              </ul>
            </div>
          </motion.aside>
        </form>
      </div>

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`pointer-events-auto flex max-w-sm items-start gap-3 border-2 px-4 py-3 shadow-[4px_4px_0px_rgba(44,24,16,0.08)] ${
                toast.type === "success"
                  ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                  : "border-[#2C1810] bg-[#FAF3E0] text-[#2C1810]"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
              )}
              <p className="font-serif text-sm font-bold">{toast.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {pendingRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#2C1810]/55 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              className="w-full max-w-md border-2 border-[#2C1810] bg-[#FAF3E0] p-6 shadow-[10px_10px_0px_rgba(44,24,16,0.15)]"
            >
              <div className="mb-4 flex items-center gap-3 border-b-2 border-[#2C1810] pb-4">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-[#2C1810] bg-white">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-black tracking-tight text-[#2C1810]">
                    Confirm role switch
                  </h3>
                  <p className="font-serif text-sm text-[#5C3A21]">
                    Change your active profile from {role} to {pendingRole}?
                  </p>
                </div>
              </div>

              <p className="font-serif text-sm leading-relaxed text-[#5C3A21]">
                This updates the default dashboard copy, avatar suggestion, and saved profile details for the selected mode.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPendingRole(null)}
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#5C3A21]/30 bg-white px-4 py-2 font-serif text-xs font-bold uppercase tracking-[0.14em] text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRoleSwitch}
                  className="btn-rubber-stamp justify-center px-5 py-2 text-xs"
                >
                  Switch role
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, error, placeholder, type = "text", className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 block font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
        {label}
      </label>
      <div className="relative">
        <Icon className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full border-b-2 bg-transparent py-3 pl-7 font-serif text-sm text-[#2C1810] placeholder-[#A89880] outline-none transition-colors ${
            error ? "border-[#2C1810]" : "border-[#5C3A21]/30 focus:border-[#2C1810]"
          }`}
        />
      </div>
      {error && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{error}</p>}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  error,
  visible,
  onToggle,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-2 block font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
        {label}
      </label>
      <div className="relative">
        <Lock className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter password"
          className={`w-full border-b-2 bg-transparent py-3 pl-7 pr-10 font-serif text-sm text-[#2C1810] placeholder-[#A89880] outline-none transition-colors ${
            error ? "border-[#2C1810]" : "border-[#5C3A21]/30 focus:border-[#2C1810]"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A89880] transition-colors hover:text-[#2C1810]"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
        </button>
      </div>
      {error && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{error}</p>}
    </div>
  );
}

export default ProfilePage;
