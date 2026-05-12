"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, updateProfile, changePassword, logout } =
    useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login?next=/account");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setSavingProfile(true);
    try {
      await updateProfile({ firstName, lastName, phone });
      setProfileMessage("Profile updated.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Change failed");
    } finally {
      setSavingPassword(false);
    }
  };

  const onLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (loading || !user) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff6b6b]" />
        </main>
        <Footer />
      </>
    );
  }

  const isSocialAccount = user.provider !== "local";

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My account</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          <a
            href="/account/addresses"
            className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff0f0] text-[#ff6b6b] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Address book</h3>
                <p className="text-xs text-gray-500">
                  Manage shipping and billing addresses
                </p>
              </div>
            </div>
            <span className="text-sm text-[#ff6b6b] font-semibold">Manage →</span>
          </a>

          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Personal info
            </h2>
            <form onSubmit={onSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    First name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Last name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
                />
              </div>
              {profileMessage && (
                <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  {profileMessage}
                </div>
              )}
              {profileError && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {profileError}
                </div>
              )}
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-sm font-bold disabled:opacity-70 inline-flex items-center gap-2"
              >
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                Save changes
              </button>
            </form>
          </section>

          {!isSocialAccount && (
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Change password
              </h2>
              <form onSubmit={onChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Current password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
                  />
                </div>
                {passwordMessage && (
                  <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    {passwordMessage}
                  </div>
                )}
                {passwordError && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {passwordError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold disabled:opacity-70 inline-flex items-center gap-2"
                >
                  {savingPassword && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Update password
                </button>
              </form>
            </section>
          )}

          {isSocialAccount && (
            <div className="bg-white rounded-2xl shadow-sm p-6 text-sm text-gray-500">
              You signed in with{" "}
              <span className="font-semibold text-gray-900 capitalize">
                {user.provider}
              </span>
              . Password changes are managed by your provider.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
