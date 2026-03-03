"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { toast } from "@/lib/store/toast";

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
  const [profileError, setProfileError] = useState("");
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
    watch: watchPassword,
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
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Profile saved", "Your changes have been applied.");
    } else {
      const json = await res.json();
      const msg = json.error ?? "Error saving";
      setProfileError(msg);
      toast.error("Failed to save", msg);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    setPasswordError("");
    if (data.newPassword !== data.confirmPassword) {
      setPasswordError("New passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    if (data.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(data.newPassword) || !/[a-z]/.test(data.newPassword) ||
        !/[0-9]/.test(data.newPassword) || !/[^A-Za-z0-9]/.test(data.newPassword)) {
      setPasswordError("Password is too weak — see requirements below");
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
      toast.success("Password changed", "You can now sign in with the new password.");
      resetPassword();
    } else {
      const json = await res.json();
      const msg = json.error ?? "Error changing password";
      setPasswordError(msg);
      toast.error("Failed to change password", msg);
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
          <PasswordInput
            id="newPassword"
            label="New password"
            placeholder="Minimum 8 characters"
            showStrength
            value={watchPassword("newPassword", "")}
            {...regPassword("newPassword")}
          />
          <PasswordInput
            id="confirmPassword"
            label="Confirm new password"
            placeholder="••••••"
            value={watchPassword("confirmPassword", "")}
            {...regPassword("confirmPassword")}
          />

          {passwordError && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{passwordError}</p>
          )}

          <Button type="submit" loading={savingPassword} className="w-full">
            Change password
          </Button>
        </form>
      </div>
    </div>
  );
}
