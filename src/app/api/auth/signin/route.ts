import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Basic validation
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Validate KAIST email
        if (!email.endsWith("@kaist.ac.kr")) {
            return NextResponse.json(
                { error: "Only KAIST email addresses are allowed" },
                { status: 400 }
            );
        }

        // Create Supabase client with cookies for session management
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore as any,
        });

        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        if (!data.user) {
            return NextResponse.json(
                { error: "Sign in failed" },
                { status: 500 }
            );
        }

        const response = NextResponse.json({
            message: "Signed in successfully",
            success: true,
        });

        // Add cache-busting headers
        response.headers.set(
            "Cache-Control",
            "no-cache, no-store, must-revalidate"
        );
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
    } catch (error: any) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
