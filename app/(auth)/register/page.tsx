"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";

const schema = z.object({
  name: z.string().min(2, "Minimum 2 characters"),
  lastName: z.string().min(2, "Minimum 2 characters"),
  dateOfBirth: z.string().min(1, "Enter your date of birth"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  role: z.enum(["USER", "SELLER"]).default("USER"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [selectedRole, setSelectedRole] = useState<"USER" | "SELLER">("USER");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: "USER" } });

  const passwordValue = watch("password", "");

  const handleRoleSelect = (role: "USER" | "SELLER") => {
    setSelectedRole(role);
    setValue("role", role);
  };

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setServerError(body.error ?? "Registration error");
      return;
    }

    // Auto sign in after registration
    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    router.push("/products");
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white p-8">
      <h1 className="text-xl font-bold text-[#0a0a0a] mb-1">Create account</h1>
      <p className="text-sm text-[#6b6b6b] mb-6">Join EcoMarket</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Role selector */}
        <div>
          <p className="text-sm font-medium text-[#0a0a0a] mb-2">I want to</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleSelect("USER")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                selectedRole === "USER"
                  ? "border-[#0a0a0a] bg-[#f5f5f5] text-[#0a0a0a]"
                  : "border-[#e5e5e5] bg-white text-[#6b6b6b] hover:border-[#c0c0c0]"
              }`}
            >
              <span className="text-xl">🛒</span>
              <span>Buy products</span>
              <span className="text-xs font-normal text-[#a3a3a3]">Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("SELLER")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                selectedRole === "SELLER"
                  ? "border-[#0a0a0a] bg-[#f5f5f5] text-[#0a0a0a]"
                  : "border-[#e5e5e5] bg-white text-[#6b6b6b] hover:border-[#c0c0c0]"
              }`}
            >
              <span className="text-xl">🌿</span>
              <span>Sell eco-products</span>
              <span className="text-xs font-normal text-[#a3a3a3]">Seller</span>
            </button>
          </div>
          <input type="hidden" {...register("role")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="name"
            label="First name"
            placeholder="John"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            id="lastName"
            label="Last name"
            placeholder="Smith"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <Input
          id="dateOfBirth"
          type="date"
          label="Date of birth"
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Minimum 8 characters"
          showStrength
          value={passwordValue}
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full mt-1">
          Create account
        </Button>
      </form>

      <p className="text-sm text-center text-[#6b6b6b] mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-[#0a0a0a] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
