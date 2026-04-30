import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  getUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../../services/api";
import { useToast, ToastContainer } from "../../utils/useToast";

type UserRecord = {
  userId: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

const ROLES = ["Admin", "Teacher", "Student", "Parent"];

const roleColor = (role: string) =>
  role === "Admin"
    ? "bg-red-100    text-red-700"
    : role === "Teacher"
      ? "bg-blue-100   text-blue-700"
      : role === "Student"
        ? "bg-green-100  text-green-700"
        : "bg-purple-100 text-purple-700";

export function ManageUsers() {
  const { toasts, success, error } = useToast();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchUsers = async () => {
    try {
      setFetching(true);
      setUsers(await getUsers());
    } catch (err: any) {
      error(err.message ?? "Failed to load users");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Update ───────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setLoading(true);
    try {
      await updateUser(editUser.userId, {
        username: editUser.username,
        email: editUser.email,
      });
      success("User updated successfully");
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      error(err.message ?? "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle Active ────────────────────────────────────────
  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await toggleUserStatus(id);
      success(
        `User ${currentStatus ? "deactivated" : "activated"} successfully`,
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === id ? { ...u, isActive: !u.isActive } : u,
        ),
      );
    } catch (err: any) {
      error(err.message ?? "Failed to toggle status");
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (
      !window.confirm("Delete this user? This will remove all associated data.")
    )
      return;
    try {
      await deleteUser(id);
      success("User deleted");
      setUsers((prev) => prev.filter((u) => u.userId !== id));
    } catch (err: any) {
      error(err.message ?? "Failed to delete user");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div>
        <h1 className="text-gray-900 mb-2">Manage Users</h1>
        <p className="text-gray-600">
          View, edit and manage all system user accounts
        </p>
      </div>

      {/* EDIT MODAL */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Edit User</h2>
              <button
                onClick={() => setEditUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={editUser.username}
                  onChange={(e) =>
                    setEditUser({ ...editUser, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-gray-600 text-sm">Role:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(editUser.role)}`}
                >
                  {editUser.role}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  (Role cannot be changed)
                </span>
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
                  onClick={() => setEditUser(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-red-600" />
          <h2 className="text-gray-900">User Accounts ({filtered.length})</h2>
        </div>
        {fetching ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700">Created</th>
                  <th className="px-6 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((u) => (
                  <tr key={u.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {u.username}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditUser(u)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(u.userId, u.isActive)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title={u.isActive ? "Deactivate" : "Activate"}
                        >
                          {u.isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(u.userId)}
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
