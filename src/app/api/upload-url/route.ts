import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { uploadUrlSchema } from "@/lib/zod-schemas";
import { sanitizeFileName } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
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
        const { file_name, file_type, file_size } = uploadUrlSchema.parse(body);

        // Sanitize filename and create unique path
        const sanitizedFileName = sanitizeFileName(file_name);
        const timestamp = Date.now();
        const uniqueFileName = `${user.id}/${timestamp}_${sanitizedFileName}`;

        // Determine bucket based on context (event images vs review photos)
        const bucket =
            body.context === "review" ? "review-photos" : "event-images";

        // Generate signed URL for upload
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUploadUrl(uniqueFileName);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Return the signed URL and the final file path
        return NextResponse.json({
            uploadUrl: data.signedUrl,
            filePath: uniqueFileName,
            publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${uniqueFileName}`,
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
