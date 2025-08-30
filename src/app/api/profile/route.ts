import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { sanitizeUserBio } from "@/lib/sanitize";

export async function GET() {
    const cookieStore = await cookies();
    try {
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore as any,
        });

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileError) {
            return NextResponse.json(
                { error: profileError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    const cookieStore = await cookies();
    try {
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore as any,
        });

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { bio, pfp } = body;

        // Sanitize bio if provided
        const updateData: any = {};
        if (bio !== undefined) {
            updateData.bio = bio ? sanitizeUserBio(bio) : null;
        }
        if (pfp !== undefined) {
            updateData.pfp = pfp;
        }

        // Update user profile
        const { data: updatedProfile, error: updateError } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", user.id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ profile: updatedProfile });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
