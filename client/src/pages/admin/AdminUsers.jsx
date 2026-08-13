import { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Search,
  UserX,
  ShieldOff,
  ShieldPlus,
} from "lucide-react";

import api from "../../services/api";
import Loading from "../../components/Loading";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [updatingAdmin, setUpdatingAdmin] = useState(null);

  // ==========================================
  // LOAD USERS
  // ==========================================

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");

      if (data.success) {
        setUsers(data.users || []);
      } else {
        throw new Error(
          data.message || "Failed to load users"
        );
      }
    } catch (error) {
      console.error("Load users error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadUsers();
  }, []);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
  };

  // ==========================================
  // UPDATE USER STATUS
  // ==========================================

  const updateStatus = async (user) => {
    const action = user.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingStatus(user._id);

      const { data } = await api.patch(
        `/admin/users/${user._id}/status`,
        {
          isActive: !user.isActive,
        }
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to update user status"
        );
      }

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === user._id
            ? {
                ...item,
                isActive: data.user?.isActive ??
                  !item.isActive,
              }
            : item
        )
      );

    } catch (error) {
      console.error(
        "Update user status error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to update user status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ==========================================
  // UPDATE ADMIN ROLE
  // ==========================================

  const updateAdmin = async (user) => {
    const action = user.isAdmin
      ? "remove admin access from"
      : "make admin";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingAdmin(user._id);

      const { data } = await api.patch(
        `/admin/users/${user._id}/admin`,
        {
          isAdmin: !user.isAdmin,
        }
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to update admin role"
        );
      }

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === user._id
            ? {
                ...item,
                isAdmin:
                  data.user?.isAdmin ??
                  !item.isAdmin,
              }
            : item
        )
      );

    } catch (error) {
      console.error(
        "Update admin role error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to update admin role"
      );
    } finally {
      setUpdatingAdmin(null);
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredUsers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name
          ?.toLowerCase()
          .includes(query) ||
        user.email
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [users, search]);

  // ==========================================
  // STATS
  // ==========================================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;

  const adminUsers = users.filter(
    (user) => user.isAdmin
  ).length;

  const subscribers = users.filter(
    (user) =>
      user.subscriptionStatus === "active"
  ).length;

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (amount = 0) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <Loading />;
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="container-main py-10">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

        <div>
          <p className="text-sm font-bold text-[#d89b28]">
            ADMIN
          </p>

          <h1 className="text-4xl font-black text-[#173f2b] mt-2">
            Users
          </h1>

          <p className="text-gray-500 mt-2">
            Manage platform users, subscriptions
            and accounts.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold inline-flex items-center gap-2 w-fit disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* ======================================
          STATS
      ====================================== */}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">

        {/* TOTAL USERS */}

        <div className="card p-6">

          <div className="w-11 h-11 rounded-xl bg-[#e9f1eb] text-[#173f2b] grid place-items-center">
            <Users size={22} />
          </div>

          <p className="text-sm text-gray-500 mt-5">
            Total Users
          </p>

          <h3 className="text-3xl font-black text-[#173f2b] mt-1">
            {totalUsers}
          </h3>

        </div>

        {/* ACTIVE USERS */}

        <div className="card p-6">

          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 grid place-items-center">
            <UserCheck size={22} />
          </div>

          <p className="text-sm text-gray-500 mt-5">
            Active Users
          </p>

          <h3 className="text-3xl font-black text-[#173f2b] mt-1">
            {activeUsers}
          </h3>

        </div>

        {/* ADMINS */}

        <div className="card p-6">

          <div className="w-11 h-11 rounded-xl bg-yellow-50 text-[#b07800] grid place-items-center">
            <ShieldCheck size={22} />
          </div>

          <p className="text-sm text-gray-500 mt-5">
            Admins
          </p>

          <h3 className="text-3xl font-black text-[#173f2b] mt-1">
            {adminUsers}
          </h3>

        </div>

        {/* SUBSCRIBERS */}

        <div className="card p-6">

          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
            <Users size={22} />
          </div>

          <p className="text-sm text-gray-500 mt-5">
            Subscribers
          </p>

          <h3 className="text-3xl font-black text-[#173f2b] mt-1">
            {subscribers}
          </h3>

        </div>

      </section>

      {/* ======================================
          SEARCH
      ====================================== */}

      <section className="mt-8">

        <div className="card p-5">

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search users by name or email..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#173f2b] focus:ring-2 focus:ring-[#173f2b]/10"
            />

          </div>

        </div>

      </section>

      {/* ======================================
          USERS TABLE
      ====================================== */}

      <section className="mt-6">

        <div className="card overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead className="bg-[#f7f9f7] border-b border-gray-200">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-black text-[#173f2b]">
                    User
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-black text-[#173f2b]">
                    Role
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-black text-[#173f2b]">
                    Status
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-black text-[#173f2b]">
                    Subscription
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-black text-[#173f2b]">
                    Draws
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-black text-[#173f2b]">
                    Wins
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-black text-[#173f2b]">
                    Prize
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-black text-[#173f2b]">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredUsers.length === 0 ? (

                  <tr>

                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No users found.
                    </td>

                  </tr>

                ) : (

                  filteredUsers.map((user) => (

                    <tr
                      key={user._id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >

                      {/* USER */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-[#e9f1eb] text-[#173f2b] grid place-items-center font-black">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div>

                            <p className="font-black text-[#173f2b]">
                              {user.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-5">

                        {user.isAdmin ? (

                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-black">
                            <ShieldCheck size={14} />
                            Admin
                          </span>

                        ) : (

                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-black">
                            User
                          </span>

                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">

                        {user.isActive ? (

                          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-black">
                            Active
                          </span>

                        ) : (

                          <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-black">
                            Inactive
                          </span>

                        )}

                      </td>

                      {/* SUBSCRIPTION */}

                      <td className="px-6 py-5">

                        <div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black ${
                              user.subscriptionStatus ===
                              "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {user.subscriptionStatus ||
                              "inactive"}
                          </span>

                          {user.subscriptionPlan && (

                            <p className="text-xs text-gray-500 mt-2 capitalize">
                              {user.subscriptionPlan}
                            </p>

                          )}

                        </div>

                      </td>

                      {/* DRAWS */}

                      <td className="px-6 py-5 font-bold text-gray-700">
                        {user.drawsEntered || 0}
                      </td>

                      {/* WINS */}

                      <td className="px-6 py-5 font-bold text-gray-700">
                        {user.totalWins || 0}
                      </td>

                      {/* PRIZE */}

                      <td className="px-6 py-5 font-black text-[#173f2b]">
                        {formatMoney(
                          user.totalPrizeMoney
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-5">

                        <div className="flex flex-col gap-2 w-[150px]">

                          {/* STATUS BUTTON */}

                          <button
                            onClick={() =>
                              updateStatus(user)
                            }
                            disabled={
                              updatingStatus ===
                              user._id
                            }
                            className={`px-3 py-2 rounded-lg text-xs font-black inline-flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                              user.isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >

                            {user.isActive ? (
                              <UserX size={14} />
                            ) : (
                              <UserCheck size={14} />
                            )}

                            {updatingStatus ===
                            user._id
                              ? "Updating..."
                              : user.isActive
                              ? "Deactivate"
                              : "Activate"}

                          </button>

                          {/* ADMIN BUTTON */}

                          <button
                            onClick={() =>
                              updateAdmin(user)
                            }
                            disabled={
                              updatingAdmin ===
                              user._id
                            }
                            className={`px-3 py-2 rounded-lg text-xs font-black inline-flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                              user.isAdmin
                                ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            }`}
                          >

                            {user.isAdmin ? (
                              <ShieldOff size={14} />
                            ) : (
                              <ShieldPlus size={14} />
                            )}

                            {updatingAdmin ===
                            user._id
                              ? "Updating..."
                              : user.isAdmin
                              ? "Remove Admin"
                              : "Make Admin"}

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* ======================================
          FOOTER INFO
      ====================================== */}

      <div className="mt-6 text-sm text-gray-500">

        Showing{" "}
        <span className="font-bold text-[#173f2b]">
          {filteredUsers.length}
        </span>{" "}
        of{" "}
        <span className="font-bold text-[#173f2b]">
          {users.length}
        </span>{" "}
        users.

      </div>

    </div>
  );
};

export default AdminUsers;