import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Heart,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import Loading from "../../components/Loading";

const AdminCharities = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
  });

  // ==========================================
  // LOAD CHARITIES
  // ==========================================

  const loadCharities = async () => {
    try {
      const { data } = await api.get("/charities");

      console.log("CHARITIES:", data);

      setCharities(
        Array.isArray(data)
          ? data
          : data.charities || []
      );
    } catch (error) {
      console.error(
        "Charity load error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to load charities"
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
    loadCharities();
  }, []);

  // ==========================================
  // ADD CHARITY
  // ==========================================

  const addCharity = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter charity name");
      return;
    }

    try {
      setAdding(true);

      const { data } = await api.post(
        "/charities",
        {
          name: form.name.trim(),
          description: form.description.trim(),
          image: form.image.trim(),
        }
      );

      console.log("ADD CHARITY RESPONSE:", data);

      const newCharity =
        data.charity || data;

      setCharities((prev) => [
        ...prev,
        newCharity,
      ]);

      setForm({
        name: "",
        description: "",
        image: "",
      });

      alert("Charity added successfully");
    } catch (error) {
      console.error(
        "Add charity error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to add charity"
      );
    } finally {
      setAdding(false);
    }
  };

  // ==========================================
  // DELETE CHARITY
  // ==========================================

  const deleteCharity = async (id) => {
    const charity = charities.find(
      (item) => item._id === id
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        charity?.name || "this charity"
      }?`
    );

    if (!confirmed) return;

    try {
      setDeleting(id);

      await api.delete(
        `/charities/${id}`
      );

      setCharities((prev) =>
        prev.filter(
          (item) => item._id !== id
        )
      );

      alert("Charity deleted successfully");
    } catch (error) {
      console.error(
        "Delete charity error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete charity"
      );
    } finally {
      setDeleting(null);
    }
  };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCharities();
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

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

        <div>
          <p className="text-sm font-bold text-[#d89b28]">
            ADMIN
          </p>

          <h1 className="text-4xl font-black text-[#173f2b] mt-2">
            Manage Charities
          </h1>

          <p className="text-gray-500 mt-2">
            Add and manage charity organizations.
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


      {/* ADD CHARITY */}

      <form
        onSubmit={addCharity}
        className="card p-6 mt-8"
      >

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-600 grid place-items-center">
            <Heart size={21} />
          </div>

          <div>
            <p className="text-sm font-bold text-[#d89b28]">
              CHARITY
            </p>

            <h2 className="font-black text-xl text-[#173f2b]">
              Add Charity
            </h2>
          </div>

        </div>


        <input
          className="input mt-5"
          placeholder="Charity name"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />


        <textarea
          className="input mt-4 min-h-[120px]"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />


        <input
          className="input mt-4"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              image: e.target.value,
            }))
          }
        />


        <button
          type="submit"
          disabled={adding}
          className="btn-primary mt-5 inline-flex items-center gap-2 disabled:opacity-50"
        >

          <Plus size={18} />

          {adding
            ? "Adding..."
            : "Add Charity"}

        </button>

      </form>


      {/* CHARITY LIST */}

      <div className="flex items-center justify-between mt-10">

        <div>
          <p className="text-sm font-bold text-[#d89b28]">
            CHARITIES
          </p>

          <h2 className="text-2xl font-black text-[#173f2b] mt-1">
            Charity Organizations
          </h2>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#e9f1eb] text-[#173f2b] text-sm font-black">
          {charities.length} total
        </span>

      </div>


      {charities.length === 0 ? (

        <div className="card mt-6 p-10 text-center">

          <Heart
            size={40}
            className="mx-auto text-gray-300"
          />

          <h3 className="font-black text-xl text-[#173f2b] mt-4">
            No charities yet
          </h3>

          <p className="text-gray-500 mt-2">
            Add your first charity organization above.
          </p>

        </div>

      ) : (

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">

          {charities.map((charity) => (

            <div
              key={charity._id}
              className="card overflow-hidden"
            >

              {/* IMAGE */}

              {charity.image ? (

                <img
                  src={charity.image}
                  alt={charity.name}
                  className="w-full h-44 object-cover"
                />

              ) : (

                <div className="w-full h-44 bg-[#e9f1eb] grid place-items-center">

                  <Heart
                    size={45}
                    className="text-[#d89b28]"
                  />

                </div>

              )}


              <div className="p-6">

                <h3 className="font-black text-xl text-[#173f2b]">
                  {charity.name}
                </h3>

                <p className="text-gray-500 mt-2 line-clamp-3">
                  {charity.description ||
                    "No description available."}
                </p>


                <button
                  onClick={() =>
                    deleteCharity(
                      charity._id
                    )
                  }
                  disabled={
                    deleting === charity._id
                  }
                  className="mt-5 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold flex items-center gap-2 disabled:opacity-50"
                >

                  <Trash2 size={16} />

                  {deleting === charity._id
                    ? "Deleting..."
                    : "Delete"}

                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default AdminCharities;