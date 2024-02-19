import { promises as fs } from "fs";
import { readTodoIdsFile } from "../route";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  try {
    let allIds = await readTodoIdsFile();
    allIds = allIds.filter((id_) => id_ !== id);

    await Promise.all([
      fs.writeFile(
        process.cwd() + "/src/database/todo-ids.json",
        JSON.stringify(allIds),
      ),
      fs.rm(process.cwd() + "/src/database/todo/" + id + ".json", {
        force: true,
      }),
    ]);
    return Response.json(request.body);
  } catch (e) {
    console.log("DELETE ERROR: ", e);
    return new Response(null, { status: 500, statusText: "INTERNAL_ERROR" });
  }
}
