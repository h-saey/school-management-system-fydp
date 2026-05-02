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
      <div className="flex min-h-[256px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Loading fees…</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm sm:p-6">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
        <span>{error}</span>
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
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          Fee Status
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
          View your fee records and payment status
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Paid",
            value: `PKR ${totalPaid.toLocaleString()}`,
            icon: CheckCircle,
            color: "text-green-600",
            iconBg: "bg-green-50",
          },
          {
            label: "Outstanding",
            value: `PKR ${totalDue.toLocaleString()}`,
            icon: DollarSign,
            color: pending > 0 ? "text-red-600" : "text-green-600",
            iconBg: pending > 0 ? "bg-red-50" : "bg-green-50",
          },
          {
            label: "Pending Terms",
            value: String(pending),
            icon: Clock,
            color: pending > 0 ? "text-red-600" : "text-green-600",
            iconBg: pending > 0 ? "bg-red-50" : "bg-green-50",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <article
              key={s.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-lg p-2 ${s.iconBg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-600">{s.label}</span>
              </div>
              <p className="text-2xl font-semibold tracking-tight text-gray-900">
                {s.value}
              </p>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            Fee Records
          </h2>
        </div>
        {fees.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500 sm:px-6">
            No fee records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80">
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
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fees.map((f) => (
                  <tr key={f.feeId} className="transition-colors hover:bg-gray-50/70">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900 sm:px-6">
                      {f.term}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-700 sm:px-6">
                      PKR {f.totalAmount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-green-700 sm:px-6">
                      PKR {f.paidAmount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-red-700 sm:px-6">
                      PKR {(f.totalAmount - f.paidAmount).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">
                      {new Date(f.dueDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(f.status)}`}
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
      </section>

      {pending > 0 && (
        <section className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
          <p>
            You have <strong>{pending}</strong> pending fee(s). Please contact
            the admin to process payment.
          </p>
        </section>
      )}
    </div>
  );
}
