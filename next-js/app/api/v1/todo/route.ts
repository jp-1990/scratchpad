import { Todo } from "@/src/types/todo";
import { promises as fs } from "fs";

async function sleep(ms = 1000) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

const MODE = Object.freeze({
  SOME: "SOME",
  ALL: "ALL",
});
type Mode = (typeof MODE)[keyof typeof MODE];

export async function readTodoFiles(ids: Todo["id"][]): Promise<Todo[]> {
  const readTodoFiles = ids.map(async (id) => {
    let todo = undefined;
    try {
      const file = await fs.readFile(
        process.cwd() + "/src/database/todo/" + id + ".json",
        "utf8",
      );
      todo = JSON.parse(file) as Todo;
    } catch (e) {
      console.error("READ ERROR: unable to find file");
    } finally {
      return todo;
    }
  });
  const todos = await Promise.all(readTodoFiles);

  return todos.filter((t) => t) as Todo[];
}

export async function readTodoIdsFile(): Promise<Todo["id"][]> {
  let ids: Todo["id"][] = [];
  try {
    const idsFile = await fs.readFile(
      process.cwd() + "/src/database/todo-ids.json",
      "utf8",
    );
    ids = JSON.parse(idsFile) as string[];
  } catch (e) {
    console.error("READ IDS ERROR: unable to find file");
  } finally {
    return ids;
  }
}

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request: Request) {
  await sleep();

  const { searchParams } = new URL(request.url);
  const ids = searchParams.getAll("id");

  let mode: Mode = MODE.ALL;
  if (ids.length) mode = MODE.SOME;

  let todos: Todo[] = [];
  try {
    if (mode === MODE.SOME) {
      todos = await readTodoFiles(ids);
    }

    if (mode === MODE.ALL) {
      const allIds = await readTodoIdsFile();
      todos = await readTodoFiles(allIds);
    }
    return Response.json(todos);
  } catch (e) {
    console.log("GET ERROR: ", e);
    return new Response(null, { status: 500, statusText: "INTERNAL_ERROR" });
  }
}

export async function POST(request: Request) {
  await sleep();

  if (!request.body) {
    return new Response(null, { status: 400, statusText: "BAD_REQUEST" });
  }
  const payload = await request.json();
  try {
    const allIds = await readTodoIdsFile();
    allIds.push(payload.id);

    await Promise.all([
      fs.writeFile(
        process.cwd() + "/src/database/todo-ids.json",
        JSON.stringify(allIds),
      ),
      fs.writeFile(
        process.cwd() + "/src/database/todo/" + payload.id + ".json",
        JSON.stringify(payload),
        { encoding: "utf8", flag: "w" },
      ),
    ]);
    return Response.json(payload);
  } catch (e) {
    console.log("POST ERROR: ", e);
    return new Response(null, { status: 500, statusText: "INTERNAL_ERROR" });
  }
}

export async function PATCH(request: Request) {
  await sleep();

  if (!request.body) {
    return new Response(null, { status: 400, statusText: "BAD_REQUEST" });
  }
  let target: Todo | undefined = undefined;
  try {
    const payload = await request.json();

    target = (await readTodoFiles([payload.id]))[0];
    if (!target) {
      return new Response(null, { status: 404, statusText: "TARGET_MISSING" });
    }

    target.title = payload.title ?? target.title;
    target.description = payload.description ?? target.description;
    target.status = payload.status ?? target.status;

    await fs.writeFile(
      process.cwd() + "/src/database/todo/" + payload.id + ".json",
      JSON.stringify(target),
      { encoding: "utf8", flag: "w" },
    );

    return Response.json(target);
  } catch (e) {
    console.log("PATCH ERROR: ", e);
    return new Response(null, { status: 500, statusText: "INTERNAL_ERROR" });
  }
}
