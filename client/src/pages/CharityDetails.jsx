import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Heart, Globe } from "lucide-react";
import api from "../services/api";
import Loading from "../components/Loading";

const CharityDetails = () => {
  const { id } = useParams();

  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharity = async () => {
      try {
        const { data } = await api.get(`/charities/${id}`);
        setCharity(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCharity();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!charity) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-black">
            Charity not found
          </h2>

          <Link
            to="/charities"
            className="btn-primary inline-block mt-5"
          >
            Back to charities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main py-12">

      <Link
        to="/charities"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#173f2b]"
      >
        <ArrowLeft size={18} />
        Back to charities
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 mt-8">

        <div>
          {charity.image ? (
            <img
              src={charity.image}
              alt={charity.name}
              className="w-full h-[420px] object-cover rounded-3xl"
            />
          ) : (
            <div className="w-full h-[420px] rounded-3xl bg-[#e9f1eb] grid place-items-center">
              <Heart
                size={80}
                className="text-[#173f2b]"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">

          {charity.featured && (
            <span className="text-[#d89b28] font-bold text-sm">
              FEATURED CHARITY
            </span>
          )}

          <h1 className="text-4xl md:text-5xl font-black text-[#173f2b] mt-2">
            {charity.name}
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mt-6">
            {charity.description ||
              "This charity is working to create meaningful impact."}
          </p>

          {charity.website && (
            <a
              href={charity.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-6 font-bold text-[#173f2b]"
            >
              <Globe size={18} />
              Visit charity website
            </a>
          )}

          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center justify-center gap-2 mt-8 w-fit"
          >
            <Heart size={18} />
            Choose this charity
          </Link>
        </div>
      </div>

      {/* Events */}
      {charity.events?.length > 0 && (
        <section className="mt-16">

          <h2 className="text-3xl font-black text-[#173f2b]">
            Upcoming events
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7">

            {charity.events.map((event, index) => (
              <div
                key={index}
                className="card p-6"
              >
                <CalendarDays className="text-[#d89b28]" />

                <h3 className="font-bold text-xl mt-4">
                  {event.title}
                </h3>

                {event.date && (
                  <p className="text-gray-500 mt-2">
                    {new Date(
                      event.date
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}

          </div>
        </section>
      )}
    </div>
  );
};

export default CharityDetails;