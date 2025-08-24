import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, password } = body;

        // Basic validation
        if (!email || !name || !password) {
            return NextResponse.json(
                { error: "Email, name, and password are required" },
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

        const { data: existingUser } = await supabaseAdmin
            .from("users")
            .select("email")
            .eq("email", email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        const { data: authData, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: "Failed to create user" },
                { status: 500 }
            );
        }

        const { error: dbError } = await supabaseAdmin.from("users").insert({
            id: authData.user.id,
            email: email,
            name: name,
        });

        if (dbError) {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json(
                { error: "Failed to create user profile" },
                { status: 500 }
            );
        }

        const response = NextResponse.json({
            message: "Account created successfully! You can now sign in.",
            success: true,
        });
        
        // Add cache-busting headers
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
    } catch (error: any) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
