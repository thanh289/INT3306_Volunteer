// Renders the user login form and handles client-side logic using NextAuth's signIn.
// app/(auth)/login/page.tsx

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthInput from "@/components/auth/AuthInput";
import { validateEmail } from "@/lib/validations/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "account_locked") {
      setGeneralError(
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
      );
      // delete error from url, not to show again
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router]);

  // update form data whenever user type in input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user types
    setErrors({ email: "", password: "" });
    setGeneralError("");
  };

  // when submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    const emailError = validateEmail(formData.email);
    const passwordError = !formData.password
      ? "Mật khẩu không được để trống"
      : null;

    if (emailError || passwordError) {
      setErrors({
        email: emailError || "",
        password: passwordError || "",
      });
      // Show toast for the first error found
      const firstError = emailError || passwordError;
      if (firstError) toast.error(firstError);
      return;
    }

    setIsLoading(true);

    try {
      // use singin instead of axios
      const result = await signIn("credentials", {
        ...formData,
        redirect: false, // not change the page automatically
      });

      if (result?.error) {
        setGeneralError(result.error);
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success("Đăng nhập thành công!");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      const errorMsg = `Đã có lỗi xảy ra: ${error}`;
      setGeneralError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer
      title="Chào mừng trở lại"
      subtitle="Đăng nhập vào tài khoản VolunteerHub của bạn"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* General Error Alert */}
        {generalError && (
          <div className="alert alert-error shadow-lg animate-shake">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{generalError}</span>
            <button
              type="button"
              onClick={() => setGeneralError("")}
              className="btn btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
        )}
        <AuthInput
          id="email"
          name="email"
          type="text"
          label="Địa chỉ Email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@gmail.com"
          error={errors.email}
          autoComplete="email"
        />

        <AuthInput
          id="password"
          name="password"
          type="password"
          label="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          rightLabel={
            <Link
              href="/forgot-password"
              className="link link-primary no-underline hover:underline"
            >
              Quên mật khẩu?
            </Link>
          }
        />

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Đang đăng nhập...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Đăng nhập
            </>
          )}
        </button>
      </form>

      <div className="divider text-base-content/50 my-6">HOẶC</div>

      <div className="text-center">
        <p className="text-sm text-base-content/70">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="link link-primary font-semibold no-underline hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </AuthContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
