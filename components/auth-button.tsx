"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="px-6 py-2 bg-white/20 text-white rounded-lg">
        Loading...
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-white">
          {/* <div className="font-semibold">{session.user.name || session.user.email}</div> */}
          <div className="font-semibold"> </div>
        </div>
        <button
          onClick={() => signOut()}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition border border-white/40"
        >
         Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("cognito")}
      className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-lg transition"
    >
      Sign In
    </button>
  );
}
