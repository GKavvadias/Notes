import { z } from "zod";
import { getSession } from "@/lib/auth";
import { toggleNoteSharing } from "@/lib/notes";

const ShareSchema = z.object({ isPublic: z.boolean() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ShareSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const note = toggleNoteSharing(id, session.user.id, parsed.data.isPublic);
  if (!note) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(note);
}
