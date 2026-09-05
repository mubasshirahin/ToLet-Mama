import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
  ImagePlus,
  Mail,
  MapPin,
  PhoneCall,
  Save,
  Sparkles,
  Star,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import {
  fetchListing,
  createListing,
  updateListing,
  fetchDraft,
  saveDraft,
  fetchProfile,
} from "../lib/api";

const LISTING_TYPES = ["Single Room", "Shared Room", "Studio", "Apartment", "Flat", "Drawing Space"];
const STATUS_TYPES = ["Available", "Booked", "Pending"];
const GENDER_TYPES = ["Male", "Female"];

// Which spec fields are relevant per property type
const TYPE_SPEC_CONFIG = {
  "Single Room":   { bedrooms: false, bathrooms: false, size: false, floor: true,  note: "Single room — size not needed" },
  "Shared Room":   { bedrooms: false, bathrooms: true,  size: false, floor: true,  note: "Shared room — size not needed" },
  "Studio":        { bedrooms: false, bathrooms: true,  size: false, floor: true,  note: "Studio — size not needed" },
  "Apartment":     { bedrooms: true,  bathrooms: true,  size: true, floor: true,  note: null },
  "Flat":          { bedrooms: true,  bathrooms: true,  size: true, floor: true,  note: null },
  "Drawing Space": { bedrooms: false, bathrooms: true,  size: false, floor: true,  note: "Drawing space — shared common area" },
};
const AMENITIES = [
  "Wi-Fi",
  "Electricity",
  "Water",
  "Gas",
  "Water supply",
  "Bua",
  "Attached Washroom",
  "Lift",
  "Balcony",
  "Parking",
  "Fridge",
  "Generator",
  "CCTV Camera",
  "Security",
  "Geyser",
  "AC",
  "Study desk",
];

// Utilities for Single Room — ordered by category: basic utilities → room features → appliances → security
const SINGLE_ROOM_UTILITIES = [
  "Wi-Fi",
  "Electricity",
  "Water",
  "Gas",
  "Bua",
  "Attached Washroom",
  "Lift",
  "Balcony",
  "Parking",
  "Fridge",
  "Generator",
  "CCTV Camera",
];

const STEPS = [
  { id: "details", label: "Property Details" },
  { id: "contact", label: "Rules & Contact" },
];

const PRICE_CONFIG = {
  "Single Room":   { placeholder: "BDT 6,000/mo", hint: "Single room • 4,500 - 12,000/mo" },
  "Shared Room":   { placeholder: "BDT 4,000/mo per bed", hint: "Shared room • per bed rent" },
  "Studio":        { placeholder: "BDT 18,000/mo", hint: "Studio • 15,000 - 25,000/mo" },
  "Apartment":     { placeholder: "BDT 40,000/mo", hint: "Apartment • full unit 30,000 - 80,000/mo" },
  "Flat":          { placeholder: "BDT 32,000/mo", hint: "Flat • full unit 25,000 - 60,000/mo" },
  "Drawing Space": { placeholder: "BDT 5,500/mo", hint: "Drawing space • shared common area 4,000 - 9,000/mo" },
};

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toDateInputValue(value) {
  if (!value) return "";
  const s = String(value).slice(0, 10);
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Try to parse e.g. "August 18, 2026" or ISO
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return "";
}

function toMonthInputValue(value) {
  if (!value) return "";
  const s = String(value).slice(0, 7);
  if (/^\d{4}-\d{2}$/.test(s)) return s;
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 7);
  return "";
}

function formatMonthDisplay(ym) {
  if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return "";
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" }); // March, 2026
}

function createEmptyForm() {
  return {
    title: "",
    price: "",
    location: "",
    type: "Single Room",
    gender: "Male",
    status: "Available",
    bedrooms: "1",
    bathrooms: "1",
    size: "",
    floor: "",
    totalOccupants: "",
    availableFrom: "",
    description: "",
    images: [],
    washroomImages: [],
    balconyImages: [],
    amenities: ["Wi-Fi", "Security"],
    rulesText: "",
    nearbyText: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    ownerVerified: true,
  };
}

function createFormFromListing(listing) {
  if (!listing) {
    return createEmptyForm();
  }

  return {
    title: listing.title || "",
    price: listing.price || "",
    location: listing.location || "",
    type: listing.type || "Single Room",
    gender: listing.gender || "Male",
    status: listing.status || "Available",
    bedrooms: String(listing.specs?.bedrooms || 1),
    bathrooms: String(listing.specs?.bathrooms || 1),
    size: listing.specs?.size || "",
    floor: listing.specs?.floor || "",
    totalOccupants: String(listing.specs?.totalOccupants || listing.specs?.occupants || ""),
    availableFrom: toMonthInputValue(listing.availableFrom || listing.available_from || ""),
    description: listing.description || "",
    images: listing.images?.length ? listing.images : listing.image ? [listing.image] : [],
    washroomImages: listing.washroom_images || listing.washroomImages || [],
    balconyImages: listing.balcony_images || listing.balconyImages || [],
    amenities: listing.amenities?.length ? listing.amenities : ["Wi-Fi", "Security"],
    rulesText: Array.isArray(listing.rules) ? listing.rules.join("\n") : "",
    nearbyText: Array.isArray(listing.nearby) ? listing.nearby.join("\n") : "",
    ownerName: listing.owner?.name || "",
    ownerPhone: listing.owner?.phone || "",
    ownerEmail: listing.owner?.email || "",
    ownerVerified: Boolean(listing.owner?.verified),
  };
}

function ListingFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const washroomFileRef = useRef(null);
  const balconyFileRef = useRef(null);
  const isEditMode = Boolean(id);
  const [existingListing, setExistingListing] = useState(null);
  const [isLoadingListing, setIsLoadingListing] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode || !id) return;
    let cancelled = false;
    setIsLoadingListing(true);
    fetchListing(id)
      .then((data) => { if (!cancelled) setExistingListing(data); })
      .catch(() => { if (!cancelled) setExistingListing(null); })
      .finally(() => { if (!cancelled) setIsLoadingListing(false); });
    return () => { cancelled = true; };
  }, [id, isEditMode]);

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(() => createFormFromListing(existingListing));
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setForm(createFormFromListing(existingListing));
    setStepIndex(0);
    setErrors({});
  }, [existingListing]);

  const previewImages = useMemo(() => form.images, [form.images]);
  const washroomPreview = useMemo(() => form.washroomImages || [], [form.washroomImages]);
  const balconyPreview = useMemo(() => form.balconyImages || [], [form.balconyImages]);
  const mainImage = previewImages[0];

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const toggleAmenity = (amenity) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
    if (errors.amenities) {
      setErrors((current) => ({ ...current, amenities: "" }));
    }
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/")).slice(0, 6);
    if (!imageFiles.length) {
      setToast("Please upload image files only.");
      return;
    }

    const previews = await Promise.all(
      imageFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          })
      )
    );

    setForm((current) => ({
      ...current,
      images: [...current.images, ...previews].slice(0, 6),
    }));
    if (errors.images) {
      setErrors((current) => ({ ...current, images: "" }));
    }
    setToast("Image preview added.");
    window.setTimeout(() => setToast(""), 1600);
    event.target.value = "";
  };

  const removeImage = (index) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const setAsThumbnail = (index) => {
    if (index === 0) return;
    setForm((current) => {
      const newImages = [...current.images];
      const [picked] = newImages.splice(index, 1);
      newImages.unshift(picked);
      return { ...current, images: newImages };
    });
    setToast("Thumbnail updated — first photo will be cover");
    setTimeout(() => setToast(""), 1600);
  };

  const handleWashroomFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const imageFiles = files.filter((f) => f.type.startsWith("image/")).slice(0, 2);
    const previews = await Promise.all(imageFiles.map((file) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); })));
    setForm((c) => ({ ...c, washroomImages: [...(c.washroomImages || []), ...previews].slice(0, 2) }));
    setToast("Washroom photo added.");
    setTimeout(() => setToast(""), 1600);
    event.target.value = "";
  };
  const removeWashroomImage = (index) => setForm((c) => ({ ...c, washroomImages: c.washroomImages.filter((_, i) => i !== index) }));

  const handleBalconyFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const imageFiles = files.filter((f) => f.type.startsWith("image/")).slice(0, 2);
    const previews = await Promise.all(imageFiles.map((file) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); })));
    setForm((c) => ({ ...c, balconyImages: [...(c.balconyImages || []), ...previews].slice(0, 2) }));
    setToast("Balcony photo added.");
    setTimeout(() => setToast(""), 1600);
    event.target.value = "";
  };
  const removeBalconyImage = (index) => setForm((c) => ({ ...c, balconyImages: c.balconyImages.filter((_, i) => i !== index) }));

  const specCfg = TYPE_SPEC_CONFIG[form.type] || TYPE_SPEC_CONFIG["Single Room"];

  // Clear errors for fields that become irrelevant when type changes
  useEffect(() => {
    setErrors((prev) => {
      const next = { ...prev };
      if (!specCfg.bedrooms) delete next.bedrooms;
      if (!specCfg.bathrooms) delete next.bathrooms;
      if (!specCfg.size) delete next.size;
      if (!specCfg.floor) delete next.floor;
      if (form.type !== "Single Room" && form.type !== "Shared Room" && form.type !== "Drawing Space") delete next.totalOccupants;
      return next;
    });
  }, [form.type, specCfg.bedrooms, specCfg.bathrooms, specCfg.size, specCfg.floor]);

  // Load draft from server (no localStorage) when creating new listing
  useEffect(() => {
    if (isEditMode) return;
    if (existingListing) return;
    let cancelled = false;
    const token = localStorage.getItem("toletmama.api_token");
    if (!token) return;
    fetchDraft()
      .then((draft) => {
        if (cancelled || !draft || typeof draft !== "object") return;
        const hasData = draft.title || draft.price || draft.location || draft.images?.length || draft.washroomImages?.length || draft.balconyImages?.length;
        if (!hasData) return;
        setForm((prev) => {
          if (String(prev.title || "").trim() || String(prev.price || "").trim() || prev.images.length) return prev;
          const safeDraft = {};
          for (const [k, v] of Object.entries(draft)) {
            if (v !== null && v !== undefined) safeDraft[k] = v;
          }
          // Ensure string fields are not null
          const base = createEmptyForm();
          for (const key of ["title","price","location","size","floor","totalOccupants","availableFrom","description","rulesText","nearbyText","ownerName","ownerPhone","ownerEmail"]) {
            if (safeDraft[key] === null) safeDraft[key] = "";
          }
          return { ...base, ...safeDraft };
        });
        setToast("Draft restored from server");
        setTimeout(() => setToast(""), 2000);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isEditMode, existingListing]);

  // Autosave draft to server on form change (debounced, no localStorage)
  useEffect(() => {
    if (isEditMode) return;
    const token = localStorage.getItem("toletmama.api_token");
    if (!token) return;
    const hasAnyData = String(form.title || "").trim() || String(form.price || "").trim() || String(form.location || "").trim() || form.images.length || form.washroomImages?.length || form.balconyImages?.length;
    if (!hasAnyData) return;
    const timer = setTimeout(() => {
      saveDraft(form).catch(() => {});
    }, 900);
    return () => clearTimeout(timer);
  }, [form, isEditMode]);

  // Auto-fill owner email/name/phone from profile (server-side, no localStorage)
  useEffect(() => {
    if (isEditMode) return;
    const token = localStorage.getItem("toletmama.api_token");
    if (!token) return;
    let cancelled = false;
    fetchProfile()
      .then((data) => {
        if (cancelled || !data) return;
        setForm((prev) => {
          // Only fill if empty to not overwrite user typing or draft
          const next = { ...prev };
          let changed = false;
          if (!String(prev.ownerEmail || "").trim() && data.email) { next.ownerEmail = data.email; changed = true; }
          if (!String(prev.ownerName || "").trim() && data.name) { next.ownerName = data.name; changed = true; }
          if (!String(prev.ownerPhone || "").trim() && data.phone) { next.ownerPhone = data.phone; changed = true; }
          return changed ? next : prev;
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isEditMode]);

  const getStepErrors = (index) => {
    const nextErrors = {};
    const isRoomType = form.type === "Single Room" || form.type === "Shared Room" || form.type === "Drawing Space";

    if (index === 0) {
      if (!String(form.title || "").trim()) nextErrors.title = "Property title is required.";
      if (!String(form.price || "").trim()) nextErrors.price = "Price is required.";
      if (!String(form.location || "").trim()) nextErrors.location = "Location is required.";
      if (!String(form.description || "").trim()) nextErrors.description = "Description is required.";
      if (!String(form.availableFrom || "").trim()) nextErrors.availableFrom = "Available date is required.";
      if (specCfg.bedrooms && !isPositiveInteger(form.bedrooms)) nextErrors.bedrooms = "Enter at least 1 bedroom.";
      if (specCfg.bathrooms && !isPositiveInteger(form.bathrooms)) nextErrors.bathrooms = "Enter at least 1 bathroom.";
      if (specCfg.size && !String(form.size || "").trim()) nextErrors.size = "Property size is required.";
      if (specCfg.floor && !String(form.floor || "").trim()) nextErrors.floor = "Floor information is required.";
      if (isRoomType && !isPositiveInteger(form.totalOccupants)) nextErrors.totalOccupants = "Total Members is required (e.g. 4).";
      // Photos moved from old step 1 — validate here since 2nd page removed
      if (!form.images.length) nextErrors.images = "Add at least one property photo via the preview on the right.";
      if (form.amenities.length < 2) nextErrors.amenities = "Choose at least two amenities.";
    }

    if (index === 1) {
      if (!String(form.ownerName || "").trim()) nextErrors.ownerName = "Owner name is required.";
      if (!String(form.ownerPhone || "").trim()) nextErrors.ownerPhone = "Owner phone is required.";
      if (!String(form.ownerEmail || "").trim()) nextErrors.ownerEmail = "Owner email is required.";
      if (String(form.ownerEmail || "").trim() && !isValidEmail(String(form.ownerEmail || "").trim())) {
        nextErrors.ownerEmail = "Enter a valid email address.";
      }
      if (!String(form.rulesText || "").trim()) nextErrors.rulesText = "Add at least one house rule.";
      if (!String(form.nearbyText || "").trim()) nextErrors.nearbyText = "Add nearby places for this listing.";
    }

    return nextErrors;
  };

  const validateStep = (index) => {
    const nextErrors = getStepErrors(index);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(stepIndex)) return;
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = STEPS.reduce((accumulator, _, index) => {
      const stepErrors = getStepErrors(index);
      return { ...accumulator, ...stepErrors };
    }, {});

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstInvalidStep = STEPS.findIndex((_, index) => Object.keys(getStepErrors(index)).length > 0);
      if (firstInvalidStep >= 0) {
        setStepIndex(firstInvalidStep);
      }
      setToast("Please fix the highlighted fields.");
      window.setTimeout(() => setToast(""), 1800);
      return;
    }

    setIsSaving(true);
    try {
      // Build specs only with relevant fields for this type
      const specs = {};
      if (specCfg.bedrooms) specs.bedrooms = Number(form.bedrooms) || 1;
      else specs.bedrooms = 1; // default for room/studio/shared
      if (specCfg.bathrooms) specs.bathrooms = Number(form.bathrooms) || 1;
      else specs.bathrooms = 1;
      if (specCfg.size) specs.size = form.size.trim();
      if (specCfg.floor) specs.floor = form.floor.trim();
      if (form.type === "Single Room" || form.type === "Shared Room" || form.type === "Drawing Space") {
        specs.totalOccupants = Number(form.totalOccupants) || null;
      }

      const highlights = [form.type];
      if (specCfg.bedrooms) highlights.push(`${form.bedrooms} bed`);
      if (specCfg.bathrooms) highlights.push(`${form.bathrooms} bath`);
      if (specCfg.size && form.size.trim()) highlights.push(form.size.trim());

      const listingPayload = {
        title: String(form.title || "").trim(),
        price: String(form.price || "").trim(),
        location: String(form.location || "").trim(),
        type: form.type,
        gender: form.gender,
        status: String(form.status || "available").toLowerCase(),
        description: String(form.description || "").trim(),
        images: form.images.length ? form.images : existingListing?.images || [],
        washroom_images: form.washroomImages?.length ? form.washroomImages : existingListing?.washroom_images || [],
        balcony_images: form.balconyImages?.length ? form.balconyImages : existingListing?.balcony_images || [],
        highlights: highlights.slice(0, 3),
        specs,
        amenities: form.amenities,
        rules: String(form.rulesText || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        nearby: String(form.nearbyText || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        available_from: String(form.availableFrom || "").trim() ? `${String(form.availableFrom).trim()}-01` : null,
      };

      const savedListing = isEditMode
        ? await updateListing(existingListing.id, listingPayload)
        : await createListing(listingPayload);
      setToast(isEditMode ? "Listing updated." : "Listing created.");
      window.setTimeout(() => {
        navigate(`/listings/${savedListing.id}`, { state: { listing: savedListing } });
      }, 300);
    } catch {
      setToast("Could not save the listing right now.");
      window.setTimeout(() => setToast(""), 1800);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditMode && !existingListing) {
    return (
      <div className="min-h-screen bg-[#FAF3E0] px-4 py-10 text-[#2C1810]">
        <div className="mx-auto max-w-3xl glass-pane rounded-3xl p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A89880]">
            Listing not found
          </p>
          <h1 className="mt-3 font-serif text-3xl font-black">We could not find that listing to edit.</h1>
          <Link to="/dashboard" className="btn-rubber-stamp mt-6 justify-center px-5 py-3 text-sm">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#2C1810]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,58,33,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(44,24,16,0.08),transparent_24%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-col gap-4 glass-pane rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to={isEditMode ? `/listings/${id}` : "/dashboard"}
              className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A89880] transition-colors hover:text-[#2C1810]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Back
            </Link>
            <h1 className="font-serif text-3xl font-black tracking-tight sm:text-4xl">
              {isEditMode ? "Edit Listing Form" : "Add Listing Form"}
            </h1>
            <p className="mt-1 max-w-2xl font-serif text-sm text-[#5C3A21]">
              Build or update a listing in two focused steps, with image previews and validation before publishing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          <input ref={washroomFileRef} type="file" accept="image/*" multiple onChange={handleWashroomFiles} className="hidden" />
          <input ref={balconyFileRef} type="file" accept="image/*" multiple onChange={handleBalconyFiles} className="hidden" />
          <section className="space-y-6">
            <div className="glass-pane rounded-2xl p-5 sm:p-6">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A89880]">
                  Step {stepIndex + 1} of {STEPS.length}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-black tracking-tight">
                  {STEPS[stepIndex].label}
                </h2>
                <div className="mt-4 h-2 overflow-hidden border border-[#5C3A21]/20 bg-[#FAF3E0]">
                  <div
                    className="h-full bg-[#2C1810] transition-all duration-300"
                    style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {stepIndex === 0 && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <Field
                      label="Title"
                      icon={Home}
                      value={form.title}
                      onChange={(value) => updateField("title", value)}
                      error={errors.title}
                      placeholder="Modern Studio near BUET"
                      className="sm:col-span-2"
                    />
                    <SelectField
                      label="Property Type"
                      value={form.type}
                      onChange={(value) => updateField("type", value)}
                      options={LISTING_TYPES}
                    />
                    <SelectField
                      label="Gender Preference"
                      value={form.gender}
                      onChange={(value) => updateField("gender", value)}
                      options={GENDER_TYPES}
                    />
                    <div>
                      <Field
                        label={form.type === "Flat" || form.type === "Apartment" ? "Full Price (per month)" : "Price (per month)"}
                        icon={Sparkles}
                        value={form.price}
                        onChange={(value) => updateField("price", value)}
                        error={errors.price}
                        placeholder={PRICE_CONFIG[form.type]?.placeholder || "BDT 18,000/mo"}
                      />
                      <p className="mt-1 font-serif text-[10px] tracking-wide" style={{ color: "var(--theme-ink-faded)" }}>
                        {PRICE_CONFIG[form.type]?.hint || ""}
                      </p>
                    </div>
                    <Field
                      label="Location"
                      icon={MapPin}
                      value={form.location}
                      onChange={(value) => updateField("location", value)}
                      error={errors.location}
                      placeholder="Banani, Dhaka"
                    />
                    {isEditMode && (
                      <SelectField
                        label="Status"
                        value={form.status}
                        onChange={(value) => updateField("status", value)}
                        options={STATUS_TYPES}
                      />
                    )}
                    {specCfg.bedrooms && (
                      <Field
                        label="Bedrooms"
                        icon={BedDouble}
                        value={form.bedrooms}
                        onChange={(value) => updateField("bedrooms", value)}
                        error={errors.bedrooms}
                        placeholder="1"
                        type="number"
                        min="1"
                      />
                    )}
                    {specCfg.bathrooms && (
                      <Field
                        label="Bathrooms"
                        icon={Bath}
                        value={form.bathrooms}
                        onChange={(value) => updateField("bathrooms", value)}
                        error={errors.bathrooms}
                        placeholder="1"
                        type="number"
                        min="1"
                      />
                    )}
                    {specCfg.size && (
                      <Field
                        label="Size"
                        icon={Sparkles}
                        value={form.size}
                        onChange={(value) => updateField("size", value)}
                        error={errors.size}
                        placeholder={form.type === "Shared Room" ? "120 sq ft (per bed)" : "320 sq ft"}
                      />
                    )}
                    {specCfg.floor && (
                      <Field
                        label="Floor"
                        icon={Sparkles}
                        value={form.floor}
                        onChange={(value) => updateField("floor", value)}
                        error={errors.floor}
                        placeholder="4th floor"
                      />
                    )}
                    {(form.type === "Single Room" || form.type === "Shared Room") && (
                      <Field
                        label="Total Members"
                        icon={Users}
                        value={form.totalOccupants}
                        onChange={(value) => updateField("totalOccupants", value)}
                        error={errors.totalOccupants}
                        placeholder="e.g. 4"
                        type="number"
                        min="1"
                      />
                    )}
                    {form.type === "Single Room" && (
                      <div className="sm:col-span-2 rounded-2xl border bg-[var(--theme-surface)] p-3" style={{ borderColor: "var(--theme-border)" }}>
                        <p className="mb-2 font-serif text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>Utilities</p>
                        <div className="flex flex-wrap gap-1.5">
                          {SINGLE_ROOM_UTILITIES.map((u) => {
                            const active = form.amenities.includes(u);
                            return (
                              <label
                                key={u}
                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${active ? "bg-[var(--theme-ink)] text-[var(--theme-bg)]" : "bg-[var(--theme-surface)] hover:border-[var(--theme-ink)]"}`}
                                style={active ? { borderColor: "var(--theme-ink)" } : { borderColor: "var(--theme-border)", color: "var(--theme-ink-muted)" }}
                              >
                                <input
                                  type="checkbox"
                                  checked={active}
                                  onChange={() => toggleAmenity(u)}
                                  className="h-3 w-3 accent-[var(--theme-ink)]"
                                />
                                {u}
                              </label>
                            );
                          })}
                        </div>
                        {errors.amenities && <p className="mt-2 font-serif text-xs text-[#2C1810]">{errors.amenities}</p>}
                      </div>
                    )}
                    {form.type !== "Single Room" && (
                      <div className="sm:col-span-2 rounded-2xl border bg-[var(--theme-surface)] p-3" style={{ borderColor: "var(--theme-border)" }}>
                        <p className="mb-2 font-serif text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>Amenities</p>
                        <div className="flex flex-wrap gap-1.5">
                          {AMENITIES.map((a) => {
                            const active = form.amenities.includes(a);
                            return (
                              <button
                                key={a}
                                type="button"
                                onClick={() => toggleAmenity(a)}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${active ? "bg-[var(--theme-ink)] text-[var(--theme-bg)]" : "bg-[var(--theme-surface)] hover:border-[var(--theme-ink)]"}`}
                                style={active ? { borderColor: "var(--theme-ink)" } : { borderColor: "var(--theme-border)", color: "var(--theme-ink-muted)" }}
                              >
                                <CheckCircle2 className="h-3 w-3 shrink-0" strokeWidth={2} />
                                {a}
                              </button>
                            );
                          })}
                        </div>
                        {errors.amenities && <p className="mt-2 font-serif text-xs text-[#2C1810]">{errors.amenities}</p>}
                      </div>
                    )}
                    <Field
                      label="Available From"
                      icon={CalendarDays}
                      value={form.availableFrom}
                      onChange={(value) => updateField("availableFrom", value)}
                      error={errors.availableFrom}
                      placeholder="March, 2026"
                      type="month"
                      className="sm:col-span-2"
                    />
                    {form.availableFrom && (
                      <p className="sm:col-span-2 mt-1 font-serif text-[10px]" style={{ color: "var(--theme-ink-faded)" }}>
                        {formatMonthDisplay(form.availableFrom)} — available from 1st of the month
                      </p>
                    )}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(event) => updateField("description", event.target.value)}
                        rows={5}
                        className="vintage-inset w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none transition-colors focus:border-[#2C1810]"
                      />
                      {errors.description && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.description}</p>}
                    </div>
                  </motion.div>
                )}

                {stepIndex === 1 && (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <Field
                      label="Owner Name"
                      icon={User}
                      value={form.ownerName}
                      onChange={(value) => updateField("ownerName", value)}
                      error={errors.ownerName}
                      placeholder="Owner full name"
                    />
                    <Field
                      label="Owner Phone"
                      icon={PhoneCall}
                      value={form.ownerPhone}
                      onChange={(value) => updateField("ownerPhone", value)}
                      error={errors.ownerPhone}
                      placeholder="+880 1712 345678"
                    />
                    <Field
                      label="Owner Email"
                      icon={Mail}
                      value={form.ownerEmail}
                      onChange={(value) => updateField("ownerEmail", value)}
                      error={errors.ownerEmail}
                      placeholder="owner@example.com"
                      type="email"
                    />
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                        House Rules
                      </label>
                      <textarea
                        value={form.rulesText}
                        onChange={(event) => updateField("rulesText", event.target.value)}
                        rows={4}
                        className="vintage-inset w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none transition-colors focus:border-[#2C1810]"
                        placeholder={"No smoking\nNo pets\n12-month minimum lease"}
                      />
                      {errors.rulesText && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.rulesText}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                        Distance From
                      </label>
                      <textarea
                        value={form.nearbyText}
                        onChange={(event) => updateField("nearbyText", event.target.value)}
                        rows={4}
                        className="vintage-inset w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none transition-colors focus:border-[#2C1810]"
                        placeholder={"AUST - 15 min Walking - 1.5km"}
                      />
                      {errors.nearbyText && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.nearbyText}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                        Review
                      </label>
                      <div className="grid gap-3 border-2 border-[#5C3A21]/20 bg-white p-4 sm:grid-cols-2">
                        <Summary label="Title" value={form.title || "Untitled"} />
                        <Summary label="Price" value={form.price || "Not set"} />
                        <Summary label="Location" value={form.location || "Not set"} />
                        <Summary label="Photos" value={`${form.images.length + (form.washroomImages?.length || 0) + (form.balconyImages?.length || 0)} selected (${form.images.length} room${form.washroomImages?.length ? ` + ${form.washroomImages.length} washroom` : ""}${form.balconyImages?.length ? ` + ${form.balconyImages.length} balcony` : ""})`} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {toast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 border-2 border-[#2C1810] bg-[#FAF3E0] px-4 py-3 font-serif text-sm font-bold"
                  >
                    {toast}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#5C3A21]/30 bg-white px-4 py-3 font-serif text-xs font-bold uppercase tracking-[0.15em] text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {stepIndex < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="btn-rubber-stamp justify-center px-6 py-3 text-sm"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-rubber-stamp justify-center px-6 py-3 text-sm disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : isEditMode ? "Update listing" : "Publish listing"}
                    <Save className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="glass-pane rounded-2xl p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A89880]">
                Form guide
              </p>
              <h3 className="mt-2 font-serif text-xl font-black">What to prepare</h3>
              <ul className="mt-4 space-y-3 font-serif text-sm text-[#5C3A21]">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                  Clear title, rent, and location details.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                  At least one photo and a few useful amenities.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                  House rules and a reliable owner contact card.
                </li>
              </ul>
            </div>

            <div className="border-2 border-[#5C3A21]/20 bg-[#2C1810] p-5 text-[#FAF3E0] shadow-[4px_4px_0px_rgba(44,24,16,0.08)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-[#FAF3E0]/30 bg-[#FAF3E0]/10">
                  <ImagePlus className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-black">Photo preview</h3>
                  <p className="font-serif text-sm text-[#F4E8C1]/80">
                    {previewImages.length ? "Uploaded images are shown before publishing." : "Upload images to see previews here."}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => {
                  const image = previewImages[index] || "";
                  const isThumbnail = index === 0 && !!image;
                  // Use stable key based on image content (first 30 chars) to keep React reconciliation correct when reordering
                  const stableKey = image ? `img-${image.slice(30, 50)}-${index}` : `empty-${index}`;
                  return (
                    <div
                      key={stableKey}
                      onClick={() => !image && fileInputRef.current?.click()}
                      className={`overflow-hidden border transition-colors ${image ? "border-[#F4E8C1]/20 bg-[#FAF3E0]/10" : "cursor-pointer border-[#F4E8C1]/20 bg-[#FAF3E0]/10 hover:border-[#F4E8C1]/40 hover:bg-[#FAF3E0]/20"}`}
                      title={image ? "Click star to set as thumbnail" : "Click to upload room photo"}
                    >
                      {image ? (
                        <div className="group relative">
                          <img src={image} alt={`Room Photo ${index + 1}`} className="h-24 w-full object-cover" />
                          <span className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${isThumbnail ? "bg-amber-400 text-[#2C1810]" : "bg-[#2C1810]/70 text-white"}`}>{isThumbnail ? "★ Thumbnail" : `Photo ${index + 1}`}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                            className="absolute right-1 top-1 bg-[#2C1810] p-1 text-white opacity-80 hover:opacity-100"
                            title="Remove photo"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {!isThumbnail && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setAsThumbnail(index); }}
                              className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-[#FAF3E0] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#2C1810] hover:bg-[var(--theme-ink)] hover:text-[var(--theme-bg)] transition-colors"
                              title="Set as thumbnail — only one at a time"
                            >
                              <Star className="h-3 w-3" />
                              Set thumbnail
                            </button>
                          )}
                          {isThumbnail && (
                            <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-amber-400 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#2C1810]">
                              <Star className="h-3 w-3 fill-current" />
                              Thumbnail
                            </span>
                          )}
                        </div>
                      ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 text-center">
                          <ImagePlus className="h-5 w-5 text-[#F4E8C1]/70" />
                          <span className="font-serif text-[10px] font-bold uppercase tracking-[0.12em] text-[#F4E8C1]">Room Photo</span>
                          <span className="font-serif text-[9px] uppercase tracking-wide text-[#F4E8C1]/60">Click to upload</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 font-serif text-[10px] leading-relaxed" style={{ color: "var(--theme-ink-faded)" }}>First photo is thumbnail. Click <span className="font-bold">Set thumbnail</span> on any other photo to make it cover — only one thumbnail at a time.</p>

              {/* Washroom photo always — separate from room photos. Balcony only when selected */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div
                  onClick={() => washroomFileRef.current?.click()}
                  className="cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-[#F4E8C1]/30 bg-[#FAF3E0]/10 transition-colors hover:border-[#F4E8C1]/60 hover:bg-[#FAF3E0]/20"
                  title="Click to upload washroom photo"
                >
                  {washroomPreview[0] ? (
                    <div className="group relative">
                      <img src={washroomPreview[0]} alt="Washroom" className="h-24 w-full object-cover" />
                      <span className="absolute left-1 top-1 rounded bg-[#2C1810]/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Washroom</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeWashroomImage(0); }} className="absolute right-1 top-1 bg-[#2C1810] p-1 text-white opacity-80 hover:opacity-100"><X className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 p-3 text-center">
                      <Bath className="h-5 w-5 text-[#F4E8C1]" />
                      <span className="font-serif text-[10px] font-bold uppercase tracking-[0.12em] text-[#F4E8C1]">Washroom Photo</span>
                      <span className="font-serif text-[9px] text-[#F4E8C1]/60">Click to upload</span>
                    </div>
                  )}
                </div>
                {form.amenities.includes("Balcony") && (
                  <div
                    onClick={() => balconyFileRef.current?.click()}
                    className="cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-[#F4E8C1]/30 bg-[#FAF3E0]/10 p-3 transition-colors hover:border-[#F4E8C1]/60 hover:bg-[#FAF3E0]/20"
                    title="Click to upload balcony photo"
                  >
                    {balconyPreview[0] ? (
                      <div className="group relative">
                        <img src={balconyPreview[0]} alt="Balcony" className="h-24 w-full object-cover" />
                        <span className="absolute left-1 top-1 rounded bg-[#2C1810]/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Balcony</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeBalconyImage(0); }} className="absolute right-1 top-1 bg-[#2C1810] p-1 text-white opacity-80 hover:opacity-100"><X className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 p-3 text-center">
                        <Building2 className="h-5 w-5 text-[#F4E8C1]" />
                        <span className="font-serif text-[10px] font-bold uppercase tracking-[0.12em] text-[#F4E8C1]">Balcony Photo</span>
                        <span className="font-serif text-[9px] text-[#F4E8C1]/60">Click to upload</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.images && <p className="mt-2 font-serif text-xs text-[#F4E8C1]">{errors.images}</p>}
              {errors.amenities && <p className="mt-1 font-serif text-xs text-[#F4E8C1]">{errors.amenities}</p>}
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, error, placeholder, className = "", type = "text", min }) {
  const inputRef = useRef(null);
  const isDate = type === "date" || type === "month";
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
        {label}
      </label>
      <div className="relative">
        <Icon
          onClick={() => isDate && inputRef.current?.showPicker?.()}
          className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${isDate ? "cursor-pointer hover:text-[#2C1810]" : ""} ${error ? "text-[#2C1810]" : "text-[#A89880]"}`}
          strokeWidth={1.5}
        />
        <input
          ref={inputRef}
          type={type}
          min={min}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          onClick={() => isDate && inputRef.current?.showPicker?.()}
          className={`w-full border-b-2 bg-transparent py-3 pl-7 font-serif text-sm text-[#2C1810] placeholder-[#A89880] outline-none transition-colors ${error ? "border-[#2C1810]" : "border-[#5C3A21]/30 focus:border-[#2C1810]"}`}
          style={isDate ? { colorScheme: "light" } : undefined}
        />
      </div>
      {error && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-b-2 border-[#5C3A21]/30 bg-transparent py-3 font-serif text-sm text-[#2C1810] outline-none transition-colors focus:border-[#2C1810]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="border border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-2">
      <p className="text-xs uppercase tracking-[0.16em] text-[#A89880]">{label}</p>
      <p className="mt-1 font-serif text-sm font-bold text-[#2C1810]">{value}</p>
    </div>
  );
}

export default ListingFormPage;
