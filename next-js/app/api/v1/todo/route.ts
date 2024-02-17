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
    const file = await fs.readFile(
      process.cwd() + "/src/database/todo/" + id + ".json",
      "utf8",
    );
    return JSON.parse(file);
  });
  const todos = await Promise.all(readTodoFiles);
  return todos;
}

export async function readTodoIdsFile(): Promise<Todo["id"][]> {
  const idsFile = await fs.readFile(
    process.cwd() + "/src/database/todo-ids.json",
    "utf8",
  );
  return JSON.parse(idsFile) as string[];
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
  } catch (e) {
    console.log("GET ERROR: ", e);
  }

  return Response.json(todos);
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
  } catch (e) {
    console.log("POST ERROR: ", e);
  }

  return Response.json(payload);
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
    if (!target) throw new Error("PATCH ERROR: unable to find target");

    target.title = payload.title ?? target.title;
    target.description = payload.description ?? target.description;
    target.status = payload.status ?? target.status;

    await fs.writeFile(
      process.cwd() + "/src/database/todo/" + payload.id + ".json",
      JSON.stringify(target),
      { encoding: "utf8", flag: "w" },
    );
  } catch (e) {
    console.log("POST ERROR: ", e);
  }

  return Response.json(target);
}
