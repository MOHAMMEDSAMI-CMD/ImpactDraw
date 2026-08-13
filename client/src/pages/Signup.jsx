import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const Signup = () => {
  const { signup } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signup(
        form.name,
        form.email,
        form.password
      );

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-5 py-12">

      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md p-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#173f2b]">
            Create your account
          </h1>

          <p className="text-gray-500 mt-2">
            Start playing with purpose.
          </p>
        </div>

        {error && (
          <div className="mt-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6">
          <label className="font-semibold text-sm">
            Full name
          </label>

          <input
            name="name"
            className="input mt-2"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-5">
          <label className="font-semibold text-sm">
            Email
          </label>

          <input
            name="email"
            type="email"
            className="input mt-2"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-5">
          <label className="font-semibold text-sm">
            Password
          </label>

          <input
            name="password"
            type="password"
            className="input mt-2"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />
        </div>

        <button
          disabled={loading}
          className="btn-primary w-full mt-7 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[#173f2b]"
          >
            Login
          </Link>
        </p>
      </form>

    </div>
  );
};

export default Signup;