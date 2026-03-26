import { z } from "zod";
import { getSession } from "@/lib/auth";
import { deleteNoteById, updateNote } from "@/lib/notes";

const UpdateNoteSchema = z.object({
  title: z.string().min(1),
  contentJson: z.string().min(1),
});

export async function PUT(
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

  const parsed = UpdateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const note = updateNote(id, session.user.id, parsed.data);
  if (!note) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(note);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  deleteNoteById(id, session.user.id);

  return new Response(null, { status: 204 });
}
