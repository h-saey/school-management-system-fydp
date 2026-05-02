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
  Copy,
  CheckCircle,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  UserRecord,
} from "../../services/api";
import { useToast, ToastContainer } from "../../utils/useToast";

const ROLES = ["Admin", "Teacher", "Student", "Parent"];

const roleColor = (role: string) =>
  role === "Admin"
    ? "bg-red-100 text-red-700"
    : role === "Teacher"
      ? "bg-blue-100 text-blue-700"
      : role === "Student"
        ? "bg-green-100 text-green-700"
        : "bg-purple-100 text-purple-700";

const emptyForm = { username: "", email: "", password: "", role: "" };

export function ManageUsers() {
  const { toasts, success, error } = useToast();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newUser, setNewUser] = useState(emptyForm);
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  const copyId = (id: number) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.role) {
      error("Please select a role");
      return;
    }
    setLoading(true);
    try {
      const result = await createUser(newUser);
      success(
        `User created! User ID: ${result.userId} — copy it to create their profile`,
      );
      setNewUser(emptyForm);
      setShowCreate(false);
      fetchUsers();
    } catch (err: any) {
      error(err.message ?? "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setLoading(true);
    try {
      await updateUser(editUser.userId, {
        username: editUser.username,
        email: editUser.email,
      });
      success("User updated");
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      error(err.message ?? "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await toggleUserStatus(id);
      success(`User ${currentStatus ? "deactivated" : "activated"}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === id ? { ...u, isActive: !u.isActive } : u,
        ),
      );
    } catch (err: any) {
      error(err.message ?? "Failed to toggle status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      success("User deleted");
      setUsers((prev) => prev.filter((u) => u.userId !== id));
    } catch (err: any) {
      error(err.message ?? "Cannot delete — user has linked records");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.userId).includes(searchTerm);
    return matchSearch && (!roleFilter || u.role === roleFilter);
  });

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-gray-900 mb-2">Manage Users</h1>
          <p className="text-gray-600">
            Create accounts and find User IDs for profile creation
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Create User
        </button>
      </div>

      {/* INSTRUCTION BANNER */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">
            How to add students, teachers, parents:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Create a user account here with the correct role</li>
            <li>
              <strong>Click the User ID</strong> in the table to copy it
            </li>
            <li>
              Go to the relevant page (Students/Teachers/Parents) and paste the
              User ID
            </li>
          </ol>
        </div>
      </div>

      {/* CREATE FORM */}
      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-900">Create New User</h2>
            <button
              onClick={() => setShowCreate(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                placeholder="e.g. john_doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="user@school.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                placeholder="Min 6 characters"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Role</option>
                {ROLES.map((r) => (
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
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create User"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
              <div className="bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="text-sm text-gray-600">Role:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(editUser.role)}`}
                >
                  {editUser.role}
                </span>
                <span className="text-xs text-gray-400">
                  (cannot be changed)
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
            placeholder="Search by username, email or User ID..."
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
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-gray-700">User ID</th>
                  <th className="px-4 py-4 text-left text-gray-700">
                    Username
                  </th>
                  <th className="px-4 py-4 text-left text-gray-700">Email</th>
                  <th className="px-4 py-4 text-left text-gray-700">Role</th>
                  <th className="px-4 py-4 text-left text-gray-700">Profile</th>
                  <th className="px-4 py-4 text-left text-gray-700">Status</th>
                  <th className="px-4 py-4 text-left text-gray-700">Created</th>
                  <th className="px-4 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((u) => (
                  <tr key={u.userId} className="hover:bg-gray-50">
                    {/* Copyable User ID */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => copyId(u.userId)}
                        title="Click to copy User ID"
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-700 rounded-lg font-mono font-bold text-gray-800 transition-colors"
                      >
                        #{u.userId}
                        {copiedId === u.userId ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-900">
                      {u.username}
                    </td>
                    <td className="px-4 py-4 text-gray-700">{u.email}</td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Profile IDs */}
                    <td className="px-4 py-4">
                      {u.hasProfile ? (
                        <div className="space-y-0.5">
                          {u.studentId && (
                            <span className="block text-xs text-green-700">
                              Student: <strong>#{u.studentId}</strong>
                            </span>
                          )}
                          {u.teacherId && (
                            <span className="block text-xs text-blue-700">
                              Teacher: <strong>#{u.teacherId}</strong>
                            </span>
                          )}
                          {u.parentId && (
                            <span className="block text-xs text-purple-700">
                              Parent: <strong>#{u.parentId}</strong>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                          No profile
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditUser(u)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(u.userId, u.isActive)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
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
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
