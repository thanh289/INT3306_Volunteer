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

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/",
      });
    } catch {
      toast.error("Đăng nhập Google thất bại");
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer
      title="Chào mừng trở lại"
      subtitle="Đăng nhập vào tài khoản VolunteerHub của bạn"
    >
      {/* Traditional Login Form */}
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
          style={{
            backgroundColor: "#0891b2",
            borderColor: "#0891b2",
            color: "white",
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = "#0e7490";
              e.currentTarget.style.borderColor = "#0e7490";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = "#0891b2";
              e.currentTarget.style.borderColor = "#0891b2";
            }
          }}
          className="btn w-full gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
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

      <div className="divider text-base-content/50 my-6"></div>

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

      <div className="divider text-base-content/50 my-6">HOẶC</div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 group"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#dadce0",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
            e.currentTarget.style.borderColor = "#d2d3d4";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.12)";
            e.currentTarget.style.borderColor = "#dadce0";
          }
        }}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-[15px]">Đăng nhập với Google</span>
      </button>
    </AuthContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthContainer title="Đăng nhập">
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </AuthContainer>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
