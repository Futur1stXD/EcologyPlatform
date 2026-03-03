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

const schema = z.object({
  name: z.string().min(2, "Minimum 2 characters"),
  lastName: z.string().min(2, "Minimum 2 characters"),
  dateOfBirth: z.string().min(1, "Enter your date of birth"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Minimum 6 characters"
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
