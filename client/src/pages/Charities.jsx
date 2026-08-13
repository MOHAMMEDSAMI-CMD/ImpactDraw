import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart } from "lucide-react";
import api from "../services/api";
import Loading from "../components/Loading";

const Charities = () => {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharities = async () => {
      try {
        const { data } = await api.get("/charities");
        setCharities(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCharities();
  }, []);

  const filteredCharities = charities.filter((charity) =>
    charity.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container-main py-12 md:py-16">

      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 text-[#d89b28] font-bold text-sm">
          <Heart size={16} />
          MAKE YOUR SUBSCRIPTION MATTER
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-[#173f2b] mt-3">
          Choose a cause.
        </h1>

        <p className="text-lg text-gray-600 mt-4">
          Find a charity you care about and make your
          membership part of something bigger.
        </p>

        <div className="relative mt-7">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            className="input pl-12"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredCharities.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <Heart
            size={40}
            className="mx-auto text-gray-300"
          />

          <h2 className="text-xl font-bold mt-4">
            No charities found
          </h2>

          <p className="text-gray-500 mt-2">
            An administrator needs to add charities first.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

          {filteredCharities.map((charity) => (
            <Link
              key={charity._id}
              to={`/charities/${charity._id}`}
              className="card overflow-hidden hover:-translate-y-1 transition duration-200"
            >
              {charity.image ? (
                <img
                  src={charity.image}
                  alt={charity.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-[#e9f1eb] grid place-items-center">
                  <Heart
                    size={45}
                    className="text-[#173f2b]"
                  />
                </div>
              )}

              <div className="p-6">
                {charity.featured && (
                  <span className="text-xs font-bold text-[#d89b28]">
                    FEATURED
                  </span>
                )}

                <h2 className="text-xl font-black text-[#173f2b] mt-2">
                  {charity.name}
                </h2>

                <p className="text-gray-600 mt-3 line-clamp-3">
                  {charity.description ||
                    "Learn more about this charity and its impact."}
                </p>

                <div className="mt-5 font-bold text-[#173f2b]">
                  View charity →
                </div>
              </div>
            </Link>
          ))}

        </div>
      )}

    </div>
  );
};

export default Charities;