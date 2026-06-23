import React from "react";

const styles = {
  pending: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  confirmed: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  rejected: "bg-orange-500/10 border-orange-500/30 text-orange-300",
  reverted: "bg-red-500/10 border-red-500/30 text-red-300",
  error: "bg-red-500/10 border-red-500/30 text-red-300",
};

export default function StatusMessage({ status }) {
  if (!status?.message) return null;
  return (
    <div role="status" className={`mb-5 rounded-xl border p-3 text-sm ${styles[status.type] || styles.error}`}>
      <span className="font-bold capitalize">{status.type}: </span>
      {status.message}
    </div>
  );
}
