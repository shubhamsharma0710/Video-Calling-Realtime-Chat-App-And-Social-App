import { useState } from "react";
import { Link } from "react-router";
import useSignUp from "../hooks/useSignUp";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const { isPending, error, signupMutation } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" data-theme="forest">
      {/* Container simplified to a single column and max-width narrowed for a cleaner look */}
      <div className="border border-primary/25 w-full max-w-md bg-base-100 rounded-xl shadow-lg overflow-hidden p-6 sm:p-8">
        
        {/* LOGO & NAME */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <img src="/setu-logo.png" alt="Setu Logo" className="w-9 h-9 object-contain" />
          </div>
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Setu
          </span>
          <div className="text-center">
            <h2 className="text-xl font-semibold">Create an Account</h2>
            <p className="text-sm opacity-70">Join Setu and start connecting worldwide!</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4 py-2">
            <span className="text-sm">{error.response?.data?.message || "Something went wrong"}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="input input-bordered w-full"
              value={signupData.fullName}
              onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="john@gmail.com"
              className="input input-bordered w-full"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="********"
              className="input input-bordered w-full"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" required />
              <span className="text-xs">
                I agree to the <span className="text-primary hover:underline">terms</span> & <span className="text-primary hover:underline">privacy</span>
              </span>
            </label>
          </div>

          <button className="btn btn-primary w-full" type="submit" disabled={isPending}>
            {isPending ? <span className="loading loading-spinner loading-xs"></span> : "Create Account"}
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;