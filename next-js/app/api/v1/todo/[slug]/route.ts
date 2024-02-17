import { promises as fs } from "fs";
import { readTodoIdsFile } from "../route";

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const id = params.slug;
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
  } catch (e) {
    console.log("POST ERROR: ", e);
  }

  return Response.json(request.body);
}
