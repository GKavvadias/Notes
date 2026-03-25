import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createNote } from "@/lib/notes";

const CreateNoteSchema = z.object({
  title: z.string().min(1),
  contentJson: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
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

  const parsed = CreateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const note = createNote(session.user.id, parsed.data);
  return Response.json(note, { status: 201 });
}
