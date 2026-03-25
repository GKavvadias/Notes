import { z } from "zod";
import { getSession } from "@/lib/auth";
import { deleteNotesByIds } from "@/lib/notes";

const BulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function DELETE(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BulkDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  deleteNotesByIds(parsed.data.ids, session.user.id);
  return new Response(null, { status: 204 });
}
