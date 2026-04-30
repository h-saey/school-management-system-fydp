import React, { useState, useEffect } from "react";
import { Heart, Plus, Edit, Trash2, Search, X } from "lucide-react";
import { getStudents } from "../../services/api";
import { useToast, ToastContainer } from "../../utils/useToast";

const API_BASE = "http://localhost:5036/api";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

type Parent = {
  parentId: number;
  relation: string;
  email: string;
  linkedStudent: {
    studentId: number;
    firstName: string;
    lastName: string;
    class: string;
    section: string;
    rollNumber: string;
  };
};

type Student = {
  studentId: number;
  firstName: string;
  lastName: string;
  rollNumber: string;
};

const emptyForm = { userId: "", studentId: "", relation: "" };
const RELATIONS = ["Father", "Mother", "Guardian"];

export function ManageParents() {
  const { toasts, success, error } = useToast();

  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editParent, setEditParent] = useState<Parent | null>(null);
  const [editRelation, setEditRelation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newParent, setNewParent] = useState(emptyForm);

  // ── Fetch ────────────────────────────────────────────────
  const fetchParents = async () => {
    try {
      setFetching(true);
      const res = await fetch(`${API_BASE}/parent`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load parents");
      setParents(await res.json());
    } catch (err: any) {
      error(err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchParents();
    getStudents()
      .then(setStudents)
      .catch(() => {});
  }, []);

  // ── Create ───────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/parent`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          userId: Number(newParent.userId),
          studentId: Number(newParent.studentId),
          relation: newParent.relation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to add parent");
      success("Parent profile created");
      setNewParent(emptyForm);
      setShowAddForm(false);
      fetchParents();
    } catch (err: any) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Update ───────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editParent) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/parent/${editParent.parentId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ relation: editRelation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to update parent");
      success("Parent updated");
      setEditParent(null);
      fetchParents();
    } catch (err: any) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this parent profile?")) return;
    try {
      const res = await fetch(`${API_BASE}/parent/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.message);
      }
      success("Parent deleted");
      setParents((prev) => prev.filter((p) => p.parentId !== id));
    } catch (err: any) {
      error(err.message ?? "Failed to delete parent");
    }
  };

  const filtered = parents.filter(
    (p) =>
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${p.linkedStudent.firstName} ${p.linkedStudent.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      p.linkedStudent.rollNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-gray-900 mb-2">Manage Parents</h1>
          <p className="text-gray-600">
            Link parents to students and manage guardian profiles
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Parent
        </button>
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-900">Link New Parent</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={newParent.userId}
                onChange={(e) =>
                  setNewParent({ ...newParent, userId: e.target.value })
                }
                placeholder="Linked User ID (must have Parent role)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newParent.studentId}
                onChange={(e) =>
                  setNewParent({ ...newParent, studentId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.firstName} {s.lastName} ({s.rollNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Relation <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newParent.relation}
                onChange={(e) =>
                  setNewParent({ ...newParent, relation: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Relation</option>
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Profile"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {editParent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Edit Parent</h2>
              <button
                onClick={() => setEditParent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Linked to:{" "}
              <span className="font-medium text-gray-900">
                {editParent.linkedStudent.firstName}{" "}
                {editParent.linkedStudent.lastName}
              </span>
            </p>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Relation
                </label>
                <select
                  value={editRelation}
                  onChange={(e) => setEditRelation(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditParent(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email or linked student name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-600" />
          <h2 className="text-gray-900">Parent Profiles ({filtered.length})</h2>
        </div>
        {fetching ? (
          <div className="p-8 text-center text-gray-500">
            Loading parents...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No parent profiles found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-gray-700">
                    Relation
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700">
                    Linked Student
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700">Class</th>
                  <th className="px-6 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((p) => (
                  <tr key={p.parentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{p.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {p.relation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {p.linkedStudent.firstName} {p.linkedStudent.lastName}
                      <span className="text-xs text-gray-500 ml-2">
                        ({p.linkedStudent.rollNumber})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {p.linkedStudent.class} - {p.linkedStudent.section}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditParent(p);
                            setEditRelation(p.relation);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.parentId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
