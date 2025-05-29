import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ijrnwpgsqsxzqdemtknz.supabase.co",
  "public-anon-key", // Replace with env variable in production
);

export default function OnboardingPage() {
  const [company, setCompany] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;
    const tenant_id = user?.id ?? crypto.randomUUID();

    await supabase
      .from("tenant_profiles")
      .upsert({ id: tenant_id, user_id: user?.id });
    await supabase
      .from("company_profiles")
      .upsert({ tenant_id, name: company, goal });

    setLoading(false);
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to Allora AI</h1>
      <input
        type="text"
        placeholder="Your company name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="p-2 text-black rounded mb-4 w-full max-w-md"
      />
      <input
        type="text"
        placeholder="Main goal or focus"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        className="p-2 text-black rounded mb-6 w-full max-w-md"
      />
      <button
        disabled={loading}
        onClick={handleSubmit}
        className="bg-green-600 px-6 py-2 rounded hover:bg-green-700"
      >
        {loading ? "Submitting..." : "Complete Onboarding"}
      </button>
    </div>
  );
}
