import { useState } from "react";
import { z } from "zod";
import { useUserStore } from "../store/userStore";
import { signup } from "../api/mockAuth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const SigninForm = () => {
  const setUser = useUserStore((s) => s.setUser);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = schema.safeParse(form);
    if (!validation.success) {
      setError("Please enter a valid email and password (min. 6 characters)");
      return;
    }

    setLoading(true);
    try {
      const res = await signup(form);
      setUser(res.user);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200  p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm p-8 space-y-6 rounded-lg border border-gray-200"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">SIGN IN</h1>
          <p className="text-gray-500">Login to get started</p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={handleChange}
              value={form.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={handleChange}
              value={form.password}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="Enter your password"
            />
          </div>
        </div>

        {error && (
          <div className="p-2 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-colors"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <div className="text-center text-sm text-gray-500">
          use this email: userone@user.com password: 123456
        </div>
      </form>
    </div>
  );
};
