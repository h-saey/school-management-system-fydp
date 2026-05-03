import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { getAuditLogs, getAuditSummary } from "../../services/api";
import { useToast, ToastContainer } from "../../utils/useToast";

type LogEntry = {
  logId:     number;
  action:    string;
  timestamp: string;
  details:   string | null;
  user:      { username: string; role: string };
};

type LogPage = {
  totalCount: number;
  page:       number;
  pageSize:   number;
  totalPages: number;
  logs:       LogEntry[];
};

type SummaryItem = { action: string; count: number };

const actionColor = (action: string) => {
  if (action.includes("DELETE"))   return "bg-red-100    text-red-700";
  if (action.includes("CREATE") || action.includes("ADD") || action.includes("REGISTER"))
                                   return "bg-green-100  text-green-700";
  if (action.includes("UPDATE") || action.includes("TOGGLE"))
                                   return "bg-yellow-100 text-yellow-700";
  if (action.includes("LOGIN"))    return "bg-blue-100   text-blue-700";
  if (action.includes("AI"))       return "bg-purple-100 text-purple-700";
  return                                  "bg-gray-100   text-gray-600";
};

export function AuditLogViewer() {
  const { toasts, error } = useToast();

  const [logPage,    setLogPage]    = useState<LogPage | null>(null);
  const [summary,    setSummary]    = useState<SummaryItem[]>([]);
  const [fetching,   setFetching]   = useState(true);
  const [page,       setPage]       = useState(1);
  const [searchUser, setSearchUser] = useState("");
  const [action,     setAction]     = useState("");
  const [fromDate,   setFromDate]   = useState("");
  const [toDate,     setToDate]     = useState("");
  const pageSize = 20;

  const fetchLogs = async (p = page) => {
    try {
      setFetching(true);
      const [logs, sum] = await Promise.all([
        getAuditLogs({
          action:   action   || undefined,
          from:     fromDate || undefined,
          to:       toDate   || undefined,
          page:     p,
          pageSize,
        }),
        getAuditSummary(30),
      ]);
      setLogPage(logs);
      setSummary(sum.breakdown ?? []);
    } catch (err: any) {
      error(err.message ?? "Failed to load audit logs");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchLogs(1); }, []);

  const handleSearch = () => { setPage(1); fetchLogs(1); };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchLogs(newPage);
  };

  const filtered = (logPage?.logs ?? []).filter(l =>
    !searchUser ||
    l.user.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div>
        <h1 className="text-gray-900 mb-2">Audit Logs</h1>
        <p className="text-gray-600">Immutable record of all system actions — FR-15</p>
      </div>

      {/* SUMMARY CARDS — top 5 actions */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {summary.slice(0, 5).map(s => (
            <div key={s.action} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2 ${actionColor(s.action)}`}>
                {s.action.replace(/_/g, " ")}
              </p>
              <p className="text-2xl font-bold text-gray-900">{s.count}</p>
              <p className="text-xs text-gray-400">last 30 days</p>
            </div>
          ))}
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              placeholder="Filter by username..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <input type="text" value={action}
            onChange={e => setAction(e.target.value)}
            placeholder="Action (e.g. LOGIN)"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          <input type="date" value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          <input type="date" value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div className="flex gap-3 mt-3">
          <button onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            <Search className="w-4 h-4" /> Search
          </button>
          <button onClick={() => {
            setSearchUser(""); setAction(""); setFromDate(""); setToDate("");
            setPage(1); fetchLogs(1);
          }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-red-600" />
            <h2 className="text-gray-900">
              Logs — {logPage ? `${logPage.totalCount} total` : "loading..."}
            </h2>
          </div>
          {logPage && (
            <p className="text-sm text-gray-500">
              Page {logPage.page} of {logPage.totalPages}
            </p>
          )}
        </div>

        {fetching ? (
          <div className="p-8 text-center text-gray-500">Loading logs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-gray-700">Timestamp</th>
                  <th className="px-5 py-3 text-left text-gray-700">User</th>
                  <th className="px-5 py-3 text-left text-gray-700">Role</th>
                  <th className="px-5 py-3 text-left text-gray-700">Action</th>
                  <th className="px-5 py-3 text-left text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(l => (
                  <tr key={l.logId} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString(undefined, {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit", second: "2-digit"
                      })}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{l.user.username}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {l.user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColor(l.action)}`}>
                        {l.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs max-w-xs truncate" title={l.details ?? ""}>
                      {l.details ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {logPage && logPage.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((logPage.page - 1) * pageSize) + 1}–{Math.min(logPage.page * pageSize, logPage.totalCount)} of {logPage.totalCount}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(logPage.page - 1)}
                disabled={logPage.page <= 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {/* Page number buttons */}
              {Array.from({ length: Math.min(5, logPage.totalPages) }, (_, i) => {
                const p = Math.max(1, logPage.page - 2) + i;
                if (p > logPage.totalPages) return null;
                return (
                  <button key={p} onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${
                      p === logPage.page
                        ? "bg-red-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}>
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(logPage.page + 1)}
                disabled={logPage.page >= logPage.totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
