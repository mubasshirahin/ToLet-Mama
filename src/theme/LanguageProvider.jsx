import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);
const bn = {
  "Browse Listings": "বাসা খুঁজুন", Messages: "বার্তা", Notifications: "বিজ্ঞপ্তি", "My Listings": "আমার বিজ্ঞাপন", "Add Listing": "বিজ্ঞাপন যোগ করুন", Saved: "সংরক্ষিত", "Verify account": "অ্যাকাউন্ট যাচাই", "Find roommates": "রুমমেট খুঁজুন", "Saved searches": "সংরক্ষিত অনুসন্ধান", "Rent calculator": "ভাড়ার হিসাব",
  Profile: "প্রোফাইল", "Help Center": "সহায়তা কেন্দ্র", Guidelines: "নির্দেশিকা", About: "পরিচিতি", "Admin review": "অ্যাডমিন পর্যালোচনা", Main: "প্রধান", Manage: "পরিচালনা", Others: "অন্যান্য",
  "Find a roommate": "রুমমেট খুঁজুন", "Share your budget and area to find people looking for a compatible home.": "আপনার বাজেট ও এলাকা দিয়ে উপযুক্ত বাসা খুঁজছেন এমন মানুষদের সঙ্গে পরিচিত হন।", "My roommate profile": "আমার রুমমেট প্রোফাইল", "Preferred area": "পছন্দের এলাকা", "Maximum monthly rent (BDT)": "সর্বোচ্চ মাসিক ভাড়া (টাকা)", "Move-in date": "বাসায় ওঠার তারিখ", "Roommate preference": "রুমমেট পছন্দ", Any: "যেকোনো", Male: "পুরুষ", Female: "নারী", "About me": "আমার সম্পর্কে", "Save profile": "প্রোফাইল সংরক্ষণ", "People looking for a roommate": "রুমমেট খুঁজছেন এমন মানুষ", Area: "এলাকা", "Maximum rent": "সর্বোচ্চ ভাড়া", "Find matches": "মিল খুঁজুন", "No matching profiles found yet.": "এখনো কোনো মিল পাওয়া যায়নি।", "Sign in to create a roommate profile and browse matches.": "রুমমেট প্রোফাইল তৈরি ও মিল দেখতে সাইন ইন করুন।", "Your profile is saved.": "আপনার প্রোফাইল সংরক্ষিত হয়েছে।", "Could not save your profile.": "প্রোফাইল সংরক্ষণ করা যায়নি।", "No introduction added.": "পরিচিতি যোগ করা হয়নি।", "flexible": "যেকোনো সময়",
  "Saved searches and alerts": "সংরক্ষিত অনুসন্ধান ও বিজ্ঞপ্তি", "Save an area and rent limit, then return to the same search when you browse.": "এলাকা ও ভাড়ার সীমা সংরক্ষণ করুন, পরে একই অনুসন্ধানে ফিরে আসুন।", "Create a search alert": "অনুসন্ধানের বিজ্ঞপ্তি তৈরি করুন", "Area or search phrase": "এলাকা বা অনুসন্ধানের শব্দ", "e.g. Mirpur": "যেমন: মিরপুর", "Save search and enable alerts": "অনুসন্ধান সংরক্ষণ ও বিজ্ঞপ্তি চালু করুন", "My saved searches": "আমার সংরক্ষিত অনুসন্ধান", "No saved searches yet.": "এখনো কোনো অনুসন্ধান সংরক্ষিত নেই।", "Search saved. Alerts are enabled for matching new listings.": "অনুসন্ধান সংরক্ষিত হয়েছে। মিল থাকা নতুন বিজ্ঞাপনের বিজ্ঞপ্তি চালু হয়েছে।", "Saved search removed.": "সংরক্ষিত অনুসন্ধান মুছে ফেলা হয়েছে।", "Sign in to manage saved searches.": "সংরক্ষিত অনুসন্ধান পরিচালনা করতে সাইন ইন করুন।", "Could not save the search.": "অনুসন্ধান সংরক্ষণ করা যায়নি।", "Could not remove this search.": "অনুসন্ধানটি মুছে ফেলা যায়নি।", "Alerts on": "বিজ্ঞপ্তি চালু", "Alerts off": "বিজ্ঞপ্তি বন্ধ", "All areas": "সব এলাকা", Optional: "ঐচ্ছিক", "including move-in month": "বাসায় ওঠার মাসসহ",
  "Rent budget calculator": "ভাড়ার বাজেট হিসাব", "Plan move-in costs and ongoing rent before arranging a viewing.": "বাসা দেখতে যাওয়ার আগে ওঠার খরচ ও নিয়মিত ভাড়ার হিসাব করুন।", "Monthly costs": "মাসিক খরচ", "Monthly rent": "মাসিক ভাড়া", "Advance or deposit": "অগ্রিম বা জামানত", "Monthly service charge": "মাসিক সার্ভিস চার্জ", "Monthly utilities": "মাসিক ইউটিলিটি বিল", "Months to budget": "কয় মাসের বাজেট", "Move-in estimate": "বাসায় ওঠার আনুমানিক খরচ", "Monthly total after move-in": "ওঠার পর মাসিক মোট খরচ", "Budget for": "বাজেট", month: "মাস", months: "মাস", "Estimates only. Actual advance, deposits, and service charges depend on the agreement.": "এটি আনুমানিক হিসাব। প্রকৃত অগ্রিম, জামানত ও সার্ভিস চার্জ চুক্তির ওপর নির্ভর করে।",
  "English": "English", "Toggle language": "ভাষা পরিবর্তন", "Search listings, messages...": "বিজ্ঞাপন বা বার্তা খুঁজুন...", "Search listings": "বিজ্ঞাপন খুঁজুন", "Gender": "লিঙ্গ", "Any gender": "যেকোনো", "Men only": "শুধু পুরুষ", "Women only": "শুধু নারী", "Open map": "ম্যাপে দেখুন", "Copy location": "ঠিকানা কপি করুন", "Location copied": "ঠিকানা কপি হয়েছে",
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
