import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);
const bn = {
  "Browse Listings": "বাসা খুঁজুন", Messages: "বার্তা", Notifications: "নোটিফিকেশন", "Roommates & Tools": "রুমমেট ও টুলস",
  "My Listings": "আমার বিজ্ঞাপন", "Add Listing": "বিজ্ঞাপন যোগ করুন", Saved: "সংরক্ষিত", "Verify account": "অ্যাকাউন্ট যাচাই",
  Profile: "প্রোফাইল", "Help Center": "সাহায্য কেন্দ্র", Guidelines: "নির্দেশিকা", About: "পরিচিতি", "Admin review": "অ্যাডমিন পর্যালোচনা",
  "Make your move easier": "বাসা খোঁজা আরও সহজ করুন", "Find a roommate, book a viewing, save a search, or plan your monthly costs.": "রুমমেট খুঁজুন, বাসা দেখার সময় নিন, সার্চ সংরক্ষণ করুন বা মাসিক খরচের হিসাব করুন।",
  roommates: "রুমমেট", viewings: "বাসা দেখা", "saved searches": "সংরক্ষিত সার্চ", "rent calculator": "ভাড়ার হিসাব",
  "My roommate profile": "আমার রুমমেট প্রোফাইল", "People looking for a roommate": "রুমমেট খুঁজছেন এমন মানুষ",
  "Save profile": "প্রোফাইল সংরক্ষণ", "Find matches": "মিল খুঁজুন", "Viewing appointments": "বাসা দেখার সময়সূচি",
  "Get alerts for new homes": "নতুন বাসার বিজ্ঞপ্তি পান", "Save search and turn on alerts": "সার্চ সংরক্ষণ ও বিজ্ঞপ্তি চালু করুন",
  "Plan the rent": "ভাড়ার বাজেট করুন", "Monthly rent": "মাসিক ভাড়া", "Advance / deposit": "অগ্রিম / জামানত",
  "Service charge per month": "মাসিক সার্ভিস চার্জ", "Utilities per month": "মাসিক ইউটিলিটি বিল", "Months to budget": "কয় মাসের বাজেট",
  "Move-in estimate": "শুরুতে মোট খরচ", "Monthly total": "মাসিক মোট খরচ",
  "Messages, viewing requests, and saved-search matches.": "বার্তা, বাসা দেখার অনুরোধ ও সংরক্ষিত সার্চের মিল।", "Mark read": "পড়া হয়েছে",
  "You are all caught up.": "সব নোটিফিকেশন দেখা হয়েছে।", "Verify your account": "আপনার অ্যাকাউন্ট যাচাই করুন",
  "Submit for review": "যাচাইয়ের জন্য পাঠান", "Admin review": "অ্যাডমিন পর্যালোচনা", "Listing reports": "বিজ্ঞাপনের রিপোর্ট",
  "Identity verification": "পরিচয় যাচাই", "View document": "ডকুমেন্ট দেখুন", Approve: "অনুমোদন", Reject: "প্রত্যাখ্যান",
  Dismiss: "বাতিল", "Hide listing": "বিজ্ঞাপন লুকান", "Open map": "ম্যাপে দেখুন", "Request a viewing": "বাসা দেখার সময় চান",
  "Report this listing": "বিজ্ঞাপনটি রিপোর্ট করুন", "Contact Owner": "বাড়িওয়ালার সঙ্গে যোগাযোগ",
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem("toletmama.language") || "en");
  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
    localStorage.setItem("toletmama.language", language);
  }, [language]);
  const value = useMemo(() => ({ language, toggleLanguage: () => setLanguage((current) => current === "en" ? "bn" : "en"), t: (text) => language === "bn" ? (bn[text] || text) : text }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
