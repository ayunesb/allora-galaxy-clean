import React from "react";

const AdminPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p>Only visible to users with the 'admin' role.</p>
    </div>
  );
};

export default AdminPage;
