import React, { useEffect, useState } from "react";
import { DollarSign, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { getMyFees, type FeeRecord } from "../../services/studentApi";

function statusBadge(status: string) {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700";
    case "Partial":
      return "bg-yellow-100 text-yellow-700";
    case "Unpaid":
      return "bg-red-100 text-red-700";
    case "Overdue":
      return "bg-red-200 text-red-800 font-semibold";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function FeeStatus() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyFees()
      .then(setFees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading fees…</div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-red-700">
        <AlertCircle className="inline w-4 h-4 mr-2" />
        {error}
      </div>
    );

  const totalDue = fees
    .filter((f) => f.status !== "Paid")
    .reduce((s, f) => s + (f.totalAmount - f.paidAmount), 0);
  const totalPaid = fees.reduce((s, f) => s + f.paidAmount, 0);
  const pending = fees.filter(
    (f) => f.status === "Unpaid" || f.status === "Overdue",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 text-xl font-semibold mb-1">Fee Status</h1>
        <p className="text-gray-500 text-sm">
          View your fee records and payment status
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Paid",
            value: `PKR ${totalPaid.toLocaleString()}`,
            icon: CheckCircle,
            color: "text-green-500",
          },
          {
            label: "Outstanding",
            value: `PKR ${totalDue.toLocaleString()}`,
            icon: DollarSign,
            color: pending > 0 ? "text-red-500" : "text-green-500",
          },
          {
            label: "Pending Terms",
            value: String(pending),
            icon: Clock,
            color: pending > 0 ? "text-red-500" : "text-green-500",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-sm text-gray-600">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Fee table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-gray-900 font-medium">Fee Records</h2>
        </div>
        {fees.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No fee records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Term",
                    "Total",
                    "Paid",
                    "Remaining",
                    "Due Date",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-gray-600 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fees.map((f) => (
                  <tr key={f.feeId} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-900 font-medium">
                      {f.term}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      PKR {f.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-green-700">
                      PKR {f.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-red-700">
                      PKR {(f.totalAmount - f.paidAmount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(f.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(f.status)}`}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pending > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-yellow-800 text-sm">
            You have <strong>{pending}</strong> pending fee(s). Please contact
            the admin to process payment.
          </p>
        </div>
      )}
    </div>
  );
}
