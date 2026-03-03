"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/products";
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setServerError("Неверный email или пароль");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white p-8">
      <h1 className="text-xl font-bold text-[#0a0a0a] mb-1">Войти</h1>
      <p className="text-sm text-[#6b6b6b] mb-6">Войдите в свой аккаунт EcoMarket</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          label="Пароль"
          placeholder="••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full mt-1">
          Войти
        </Button>
      </form>

      <p className="text-sm text-center text-[#6b6b6b] mt-5">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-[#0a0a0a] font-medium hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
