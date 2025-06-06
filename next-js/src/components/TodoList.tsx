"use client";

import { useTodoList } from "@/src/hooks/useTodoList";
import { Todo } from "../types/todo";

type Props = {
  todos: Todo[];
};

export default function TodoList({ todos }: Props) {
  const { todoList, addTodo, updateTodo, deleteTodo } = useTodoList(todos);
  async function onSubmit(e: any) {
    e.preventDefault();

    const title = e.target["title"].value;
    const description = e.target["description"].value;
    await addTodo({ title, description });
  }

  async function onDelete(e: any) {
    const id = e.target.id.replace(/delete-/, "");
    await deleteTodo(id);
  }

  async function onDone(e: any) {
    const id = e.target.id.replace(/done-/, "");
    await updateTodo(id, { status: "done" });
  }

  return (
    <div className="flex font-mono">
      <section id="list" className="w-72 mr-4">
        {todoList.map((todo) => {
          return (
            <article
              key={todo.id}
              className="p-1 mb-2 border border-teal-300 rounded-xs"
            >
              <div className="flex justify-between">
                <span className="flex">
                  <h1 className="text-lg font-bold">{todo.title}</h1>
                </span>
                <button
                  id={`delete-${todo.id}`}
                  onClick={onDelete}
                  type="button"
                  className="p-2 leading-4"
                >
                  X
                </button>
              </div>
              <p className="text-sm mb-4">{todo.description}</p>
              <div className="flex items-center">
                <span
                  className={`h-4 w-auto flex flex-1 text-xs ${
                    todo.status === "done"
                      ? "bg-green-500 text-green-200"
                      : "bg-yellow-500 text-yellow-700"
                  }`}
                >
                  id:{todo.id.split("-")[0]}
                </span>
                <button
                  type="button"
                  id={`done-${todo.id}`}
                  onClick={onDone}
                  disabled={todo.status === "done"}
                  className={`${
                    todo.status === "done"
                      ? "bg-teal-100 text-teal-300 invisible w-0 h-0 px-0"
                      : "bg-teal-500 ml-1 px-2 text-xs"
                  }`}
                >
                  Done
                </button>
              </div>
            </article>
          );
        })}
      </section>
      <section id="manage" className="">
        <div className="">
          <h1 className="text-lg">NEW</h1>
          <form onSubmit={onSubmit} className="flex flex-col">
            <label htmlFor="title" className="text-sm">
              Title:
            </label>
            <input type="text" id="title" name="title" className="text-black" />
            <label htmlFor="description" className="text-sm">
              Description:
            </label>
            <input
              type="text"
              id="description"
              name="description"
              className="text-black"
            />
            <button type="submit" className="mt-2">
              Create
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
