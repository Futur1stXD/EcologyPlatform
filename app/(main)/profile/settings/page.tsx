"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type ProfileForm = {
  name: string;
  lastName: string;
  dateOfBirth: string;
  bio: string;
  email: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfileSettingsPage() {
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(true);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { isSubmitting: savingProfile },
  } = useForm<ProfileForm>();

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { isSubmitting: savingPassword },
  } = useForm<PasswordForm>();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        resetProfile({
          name: data.name ?? "",
          lastName: data.lastName ?? "",
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString().split("T")[0]
            : "",
          bio: data.bio ?? "",
          email: data.email ?? "",
        });
        setLoading(false);
      });
  }, [resetProfile]);

  const onSaveProfile = async (data: ProfileForm) => {
    setProfileError("");
    setProfileSuccess("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setProfileSuccess("Saved successfully!");
    } else {
      const json = await res.json();
      setProfileError(json.error ?? "Error saving");
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    setPasswordError("");
    setPasswordSuccess("");
    if (data.newPassword !== data.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });
    if (res.ok) {
      setPasswordSuccess("Password changed successfully!");
      resetPassword();
    } else {
      const json = await res.json();
      setPasswordError(json.error ?? "Error changing password");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/profile" className="text-sm text-[#6b6b6b] hover:text-[#0a0a0a]">
          ← Back to profile
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-8">Profile Settings</h1>

      {/* Personal info */}
      <div className="border border-[#e5e5e5] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-[#0a0a0a] mb-5">Personal information</h2>

        {loading ? (
          <p className="text-sm text-[#6b6b6b]">Loading…</p>
        ) : (
          <form onSubmit={handleProfile(onSaveProfile)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="name"
                label="First name"
                placeholder="John"
                {...regProfile("name")}
              />
              <Input
                id="lastName"
                label="Last name"
                placeholder="Doe"
                {...regProfile("lastName")}
              />
            </div>

            <Input
              id="dateOfBirth"
              type="date"
              label="Date of birth"
              {...regProfile("dateOfBirth")}
            />

            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              {...regProfile("email")}
            />

            <Textarea
              id="bio"
              label="Bio"
              placeholder="Tell something about yourself…"
              {...regProfile("bio")}
            />

            {profileError && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                {profileSuccess}
              </p>
            )}

            <Button type="submit" loading={savingProfile} className="w-full">
              Save changes
            </Button>
          </form>
        )}
      </div>

      {/* Change password */}
      <div className="border border-[#e5e5e5] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-[#0a0a0a] mb-5">Change password</h2>

        <form onSubmit={handlePassword(onChangePassword)} className="flex flex-col gap-4">
          <Input
            id="currentPassword"
            type="password"
            label="Current password"
            placeholder="••••••"
            {...regPassword("currentPassword")}
          />
          <Input
            id="newPassword"
            type="password"
            label="New password"
            placeholder="••••••"
            {...regPassword("newPassword")}
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm new password"
            placeholder="••••••"
            {...regPassword("confirmPassword")}
          />

          {passwordError && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              {passwordSuccess}
            </p>
          )}

          <Button type="submit" loading={savingPassword} className="w-full">
            Change password
          </Button>
        </form>
      </div>
    </div>
  );
}
