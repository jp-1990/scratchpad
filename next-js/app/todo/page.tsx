import TodoList from "@/src/components/TodoList";
import { readTodoFiles, readTodoIdsFile } from "../api/v1/todo/route";

export default async function Page() {
  const allIds = await readTodoIdsFile();
  const todos = await readTodoFiles(allIds);

  return (
    <>
      <TodoList todos={todos} />
    </>
  );
}
