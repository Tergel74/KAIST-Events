"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpSchema, type SignUpInput } from "@/lib/zod-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

function SignUp() {
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const errorParam = searchParams.get("error");

    // Handle URL error parameters
    useEffect(() => {
        if (errorParam === "account_not_found") {
            setGlobalError(
                "You tried to sign in but no account was found. Please create an account first."
            );
        }
    }, [errorParam]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpInput) => {
        setIsLoading(true);
        setGlobalError(null);

        try {
            // Call our signup API
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle validation errors
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach((err: any) => {
                        if (err.path && err.path[0]) {
                            setError(err.path[0] as keyof SignUpInput, {
                                type: "manual",
                                message: err.message,
                            });
                        }
                    });
                    return;
                }
                throw new Error(result.error || "Signup failed");
            }

            // Account created successfully, redirect to login
            router.push(
                "/auth/login?message=Account created successfully! You can now sign in."
            );
        } catch (err) {
            if (err instanceof Error) {
                setGlobalError(err.message);
            } else {
                setGlobalError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen-navbar flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your KAIST Events account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join the KAIST community and start discovering events
                    </p>
                </div>

                <form
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {globalError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {globalError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Full Name
                            </label>
                            <input
                                {...register("name")}
                                type="text"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your full name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                KAIST Email
                            </label>
                            <input
                                {...register("email")}
                                type="email"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="your.email@kaist.ac.kr"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                {...register("password")}
                                type="password"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter a secure password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Confirm Password
                            </label>
                            <input
                                {...register("confirmPassword")}
                                type="password"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirm your password"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading
                                ? "Creating account..."
                                : "Create Account"}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignUp />
        </Suspense>
    );
}
