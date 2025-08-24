"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";

// Create a form-specific schema for react-hook-form
const loginFormSchema = z.object({
    email: z.string().email("Invalid email format").refine((email: string) => {
        return email.endsWith("@kaist.ac.kr");
    }, "Only KAIST email addresses are allowed"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormInput = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");

    // Handle URL parameters
    useEffect(() => {
        if (messageParam) {
            setSuccessMessage(messageParam);
        }
        if (errorParam === "auth_failed") {
            setGlobalError("Authentication failed. Please try again.");
        } else if (errorParam === "invalid_email") {
            setGlobalError("Only KAIST email addresses are allowed.");
        }
    }, [errorParam, messageParam]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginFormInput>({
        resolver: zodResolver(loginFormSchema),
    });

    const onSubmit = async (data: LoginFormInput) => {
        setIsLoading(true);
        setGlobalError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle validation errors
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach((err: any) => {
                        if (err.path && err.path[0]) {
                            setError(err.path[0] as keyof LoginFormInput, {
                                type: "manual",
                                message: err.message,
                            });
                        }
                    });
                    return;
                }
                throw new Error(result.error || "Sign in failed");
            }

            // Password login successful - redirect
            router.push(redirectedFrom);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to KAIST Events
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Access your account and discover events
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                            {successMessage}
                        </div>
                    )}
                    
                    {globalError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {globalError}
                        </div>
                    )}

                    <div className="space-y-4">
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
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
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
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                href="/auth/signup"
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
