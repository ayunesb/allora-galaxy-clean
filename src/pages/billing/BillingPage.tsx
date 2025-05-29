export default function BillingPage() {
  const openStripePortal = async () => {
    const res = await fetch("/api/create-portal-link", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else alert("Unable to open billing portal.");
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Manage Your Subscription</h1>
      <button
        onClick={openStripePortal}
        className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700"
      >
        Open Stripe Billing Portal
      </button>
    </div>
  );
}
