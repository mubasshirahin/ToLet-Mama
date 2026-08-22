import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bath,
  BedDouble,
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
  Upload,
  User,
  X,
} from "lucide-react";
import {
  createListingId,
  getListingById,
  upsertListing,
} from "../data/listings";

const LISTING_TYPES = ["Room", "Shared Room", "Studio", "Apartment", "Flat"];
const STATUS_TYPES = ["Available", "Booked", "Pending"];
const AMENITIES = [
  "Wi-Fi",
  "Lift",
  "Parking",
  "Security",
  "Generator",
  "Geyser",
  "AC",
  "Balcony",
  "Study desk",
  "Water supply",
];

const STEPS = [
  { id: "details", label: "Property Details" },
  { id: "media", label: "Photos & Amenities" },
  { id: "contact", label: "Rules & Contact" },
];

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createEmptyForm() {
  return {
    title: "",
    price: "",
    location: "",
    type: "Room",
    status: "Available",
    bedrooms: "1",
    bathrooms: "1",
    size: "",
    floor: "",
    availableFrom: "",
    description: "",
    images: [],
    amenities: ["Wi-Fi", "Security"],
    rulesText: "",
    nearbyText: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    ownerResponse: "Usually replies within 1 hour",
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
    type: listing.type || "Room",
    status: listing.status || "Available",
    bedrooms: String(listing.specs?.bedrooms || 1),
    bathrooms: String(listing.specs?.bathrooms || 1),
    size: listing.specs?.size || "",
    floor: listing.specs?.floor || "",
    availableFrom: listing.availableFrom || "",
    description: listing.description || "",
    images: listing.images?.length ? listing.images : listing.image ? [listing.image] : [],
    amenities: listing.amenities?.length ? listing.amenities : ["Wi-Fi", "Security"],
    rulesText: Array.isArray(listing.rules) ? listing.rules.join("\n") : "",
    nearbyText: Array.isArray(listing.nearby) ? listing.nearby.join("\n") : "",
    ownerName: listing.owner?.name || "",
    ownerPhone: listing.owner?.phone || "",
    ownerEmail: listing.owner?.email || "",
    ownerResponse: listing.owner?.response || "Usually replies within 1 hour",
    ownerVerified: Boolean(listing.owner?.verified),
  };
}

function ListingFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const isEditMode = Boolean(id);
  const existingListing = useMemo(() => (isEditMode ? getListingById(id) : null), [id, isEditMode]);

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

  const getStepErrors = (index) => {
    const nextErrors = {};

    if (index === 0) {
      if (!form.title.trim()) nextErrors.title = "Property title is required.";
      if (!form.price.trim()) nextErrors.price = "Price is required.";
      if (!form.location.trim()) nextErrors.location = "Location is required.";
      if (!form.description.trim()) nextErrors.description = "Description is required.";
      if (!form.availableFrom.trim()) nextErrors.availableFrom = "Available date is required.";
      if (!isPositiveInteger(form.bedrooms)) nextErrors.bedrooms = "Enter at least 1 bedroom.";
      if (!isPositiveInteger(form.bathrooms)) nextErrors.bathrooms = "Enter at least 1 bathroom.";
      if (!form.size.trim()) nextErrors.size = "Property size is required.";
      if (!form.floor.trim()) nextErrors.floor = "Floor information is required.";
    }

    if (index === 1) {
      if (!form.images.length) nextErrors.images = "Add at least one property photo.";
      if (form.amenities.length < 2) nextErrors.amenities = "Choose at least two amenities.";
    }

    if (index === 2) {
      if (!form.ownerName.trim()) nextErrors.ownerName = "Owner name is required.";
      if (!form.ownerPhone.trim()) nextErrors.ownerPhone = "Owner phone is required.";
      if (!form.ownerEmail.trim()) nextErrors.ownerEmail = "Owner email is required.";
      if (form.ownerEmail.trim() && !isValidEmail(form.ownerEmail.trim())) {
        nextErrors.ownerEmail = "Enter a valid email address.";
      }
      if (!form.rulesText.trim()) nextErrors.rulesText = "Add at least one house rule.";
      if (!form.nearbyText.trim()) nextErrors.nearbyText = "Add nearby places for this listing.";
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
      await new Promise((resolve) => window.setTimeout(resolve, 500));

      const listing = {
        id: existingListing?.id || createListingId(),
        title: form.title.trim(),
        price: form.price.trim(),
        location: form.location.trim(),
        type: form.type,
        status: form.status,
        image: form.images[0] || existingListing?.image || "",
        images: form.images.length ? form.images : existingListing?.images || [],
        description: form.description.trim(),
        highlights: [form.type, `${form.bedrooms} bed`, `${form.bathrooms} bath`].slice(0, 3),
        specs: {
          bedrooms: Number(form.bedrooms) || 1,
          bathrooms: Number(form.bathrooms) || 1,
          size: form.size.trim(),
          floor: form.floor.trim(),
        },
        amenities: form.amenities,
        rules: form.rulesText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        nearby: form.nearbyText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        availableFrom: form.availableFrom.trim(),
        posted: existingListing?.posted || "Just now",
        interested: existingListing?.interested || 0,
        owner: {
          name: form.ownerName.trim(),
          role: "Owner",
          phone: form.ownerPhone.trim(),
          email: form.ownerEmail.trim(),
          response: form.ownerResponse.trim(),
          verified: form.ownerVerified,
          avatar: existingListing?.owner?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        },
      };

      const savedListing = upsertListing(listing);
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
        <div className="mx-auto max-w-3xl border-2 border-[#5C3A21]/20 bg-white p-8 text-center">
          <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
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
        <header className="mb-6 flex flex-col gap-4 border-2 border-[#5C3A21]/20 bg-white p-4 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to={isEditMode ? `/listings/${id}` : "/dashboard"}
              className="mb-3 inline-flex items-center gap-2 font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880] transition-colors hover:text-[#2C1810]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Back
            </Link>
            <h1 className="font-serif text-3xl font-black tracking-tight sm:text-4xl">
              {isEditMode ? "Edit Listing Form" : "Add Listing Form"}
            </h1>
            <p className="mt-1 max-w-2xl font-serif text-sm text-[#5C3A21]">
              Build or update a listing in three focused steps, with image previews and validation before publishing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border-2 border-[#2C1810] bg-[#FAF3E0] px-3 py-2 font-serif text-xs font-bold uppercase tracking-[0.15em]">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              {isEditMode ? "Editing" : "Creating"}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-coupon-clip px-4 py-2 text-[10px]"
            >
              <Upload className="h-4 w-4" strokeWidth={1.8} />
              Upload photos
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="border-2 border-[#5C3A21]/20 bg-white p-5 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:p-6">
              <div className="mb-4">
                <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
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
                    <Field
                      label="Price"
                      icon={Sparkles}
                      value={form.price}
                      onChange={(value) => updateField("price", value)}
                      error={errors.price}
                      placeholder="BDT 18,000/mo"
                    />
                    <Field
                      label="Location"
                      icon={MapPin}
                      value={form.location}
                      onChange={(value) => updateField("location", value)}
                      error={errors.location}
                      placeholder="Banani, Dhaka"
                    />
                    <SelectField
                      label="Property Type"
                      value={form.type}
                      onChange={(value) => updateField("type", value)}
                      options={LISTING_TYPES}
                    />
                    <SelectField
                      label="Status"
                      value={form.status}
                      onChange={(value) => updateField("status", value)}
                      options={STATUS_TYPES}
                    />
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
                    <Field
                      label="Size"
                      icon={Sparkles}
                      value={form.size}
                      onChange={(value) => updateField("size", value)}
                      error={errors.size}
                      placeholder="320 sq ft"
                    />
                    <Field
                      label="Floor"
                      icon={Sparkles}
                      value={form.floor}
                      onChange={(value) => updateField("floor", value)}
                      error={errors.floor}
                      placeholder="4th floor"
                    />
                    <Field
                      label="Available From"
                      icon={CalendarDays}
                      value={form.availableFrom}
                      onChange={(value) => updateField("availableFrom", value)}
                      error={errors.availableFrom}
                      placeholder="August 18, 2026"
                      className="sm:col-span-2"
                    />
                    <div className="sm:col-span-2">
                      <label className="mb-2 block font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
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
                    key="media"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="border-2 border-[#5C3A21]/20 bg-[#FAF3E0] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
                            Photo upload
                          </p>
                          <h3 className="font-serif text-xl font-black">Image preview before upload</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-rubber-stamp justify-center px-5 py-3 text-sm"
                        >
                          <ImagePlus className="h-4 w-4" strokeWidth={1.8} />
                          Add photos
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFiles}
                        className="hidden"
                      />

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {previewImages.length ? (
                          previewImages.map((image, index) => (
                            <div key={`${image}-${index}`} className="group relative overflow-hidden border-2 border-[#5C3A21]/20 bg-white">
                              <img src={image} alt={`Preview ${index + 1}`} className="h-32 w-full object-cover" />
                              {index === 0 && (
                                <span className="absolute left-2 top-2 border border-[#2C1810] bg-[#FAF3E0] px-2 py-1 font-serif text-[9px] font-bold uppercase tracking-[0.12em]">
                                  Main
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute right-2 top-2 border border-[#2C1810] bg-[#FAF3E0] p-1 opacity-90 transition-opacity hover:opacity-100"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="col-span-full flex min-h-[160px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#5C3A21]/30 bg-white px-4 text-center"
                          >
                            <Upload className="h-8 w-8 text-[#A89880]" strokeWidth={1.7} />
                            <p className="mt-3 font-serif text-sm font-bold text-[#2C1810]">
                              Drop or select up to 6 photos
                            </p>
                            <p className="mt-1 font-serif text-xs text-[#5C3A21]">
                              JPG, PNG, or WEBP previews will show here instantly.
                            </p>
                          </button>
                        )}
                      </div>
                      {errors.images && <p className="mt-2 font-serif text-xs text-[#2C1810]">{errors.images}</p>}
                    </div>

                    <div className="border-2 border-[#5C3A21]/20 bg-white p-4">
                      <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
                        Amenities checklist
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {AMENITIES.map((amenity) => (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className={`flex items-center gap-2 border-2 px-3 py-2 text-left font-serif text-xs font-bold uppercase tracking-[0.08em] transition-all ${
                              form.amenities.includes(amenity)
                                ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                                : "border-[#5C3A21]/20 bg-[#FAF3E0] text-[#5C3A21] hover:border-[#2C1810] hover:text-[#2C1810]"
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.7} />
                            {amenity}
                          </button>
                        ))}
                      </div>
                      {errors.amenities && <p className="mt-2 font-serif text-xs text-[#2C1810]">{errors.amenities}</p>}
                    </div>
                  </motion.div>
                )}

                {stepIndex === 2 && (
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
                    <Field
                      label="Response Time"
                      icon={Sparkles}
                      value={form.ownerResponse}
                      onChange={(value) => updateField("ownerResponse", value)}
                      placeholder="Usually replies within 1 hour"
                    />
                    <div className="sm:col-span-2">
                      <label className="mb-2 block font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
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
                      <label className="mb-2 block font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                        Nearby Places
                      </label>
                      <textarea
                        value={form.nearbyText}
                        onChange={(event) => updateField("nearbyText", event.target.value)}
                        rows={4}
                        className="vintage-inset w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none transition-colors focus:border-[#2C1810]"
                        placeholder={"BUET - 8 min\nBus stop - 3 min\nLalbagh - 12 min"}
                      />
                      {errors.nearbyText && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.nearbyText}</p>}
                    </div>
                    <label className="sm:col-span-2 flex items-start gap-3 border-2 border-[#5C3A21]/20 bg-[#FAF3E0] p-4">
                      <input
                        type="checkbox"
                        checked={form.ownerVerified}
                        onChange={(event) => updateField("ownerVerified", event.target.checked)}
                        className="mt-0.5 accent-[#2C1810]"
                      />
                      <span className="font-serif text-sm text-[#5C3A21]">
                        Mark owner as verified in the contact card
                      </span>
                    </label>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                        Review
                      </label>
                      <div className="grid gap-3 border-2 border-[#5C3A21]/20 bg-white p-4 sm:grid-cols-2">
                        <Summary label="Title" value={form.title || "Untitled"} />
                        <Summary label="Price" value={form.price || "Not set"} />
                        <Summary label="Location" value={form.location || "Not set"} />
                        <Summary label="Photos" value={`${form.images.length} selected`} />
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
            <div className="border-2 border-[#5C3A21]/20 bg-white p-5 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:p-6">
              <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
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
                {(mainImage ? [mainImage, ...previewImages.slice(1, 4)] : Array.from({ length: 4 }).map(() => "")).map((image, index) => (
                  <div key={`${image || "empty"}-${index}`} className="overflow-hidden border border-[#F4E8C1]/20 bg-[#FAF3E0]/10">
                    {image ? (
                      <img src={image} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover" />
                    ) : (
                      <div className="flex h-24 items-center justify-center font-serif text-[10px] uppercase tracking-[0.2em] text-[#F4E8C1]/70">
                        Empty
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, error, placeholder, className = "", type = "text", min }) {
  return (
    <div className={className}>
      <label className="mb-2 block font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
        {label}
      </label>
      <div className="relative">
        <Icon className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
        <input
          type={type}
          min={min}
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

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
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
      <p className="font-serif text-[10px] uppercase tracking-[0.16em] text-[#A89880]">{label}</p>
      <p className="mt-1 font-serif text-sm font-bold text-[#2C1810]">{value}</p>
    </div>
  );
}

export default ListingFormPage;
