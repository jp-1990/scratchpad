import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useNetworkStatus } from "./useNetworkStatus";
import { NewTodoPayload, Todo, UpdateTodoPayload } from "../types/todo";

let listeners: (() => void)[] = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}

function getSnapshot() {
  let todos = window.localStorage.getItem("todos") ?? "[]";
  return todos;
}

function getServerSnapshot() {
  return "[]";
}

async function addTodo(todo: NewTodoPayload) {
  const uuid = crypto.randomUUID();
  const todos = JSON.parse(
    window.localStorage.getItem("todos") ?? "[]",
  ) as Todo[];
  const newTodo = {
    id: uuid,
    title: todo.title,
    description: todo.description,
    status: "pending",
  } as const;
  todos.push(newTodo);

  window.localStorage.setItem("todos", JSON.stringify(todos));
  emitChange();
  await fetch("/api/v1/todo", {
    method: "POST",
    body: JSON.stringify(newTodo),
  });
}

function overwriteAll(todos: Todo[]) {
  window.localStorage.setItem("todos", JSON.stringify(todos));
  emitChange();
}

export function useTodoList(todos: Todo[]) {
  const { isOnline } = useNetworkStatus();
  const firstRender = useRef(true);

  const updateSignals = useRef<Record<string, AbortController | undefined>>({});
  const deleteSignals = useRef<Record<string, AbortController | undefined>>({});

  useEffect(() => {
    overwriteAll(todos);
    firstRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTodo = useCallback(
    async (id: Todo["id"], payload: UpdateTodoPayload) => {
      let todos = JSON.parse(
        window.localStorage.getItem("todos") ?? "[]",
      ) as Todo[];

      const targetIndex = todos.findIndex((t) => t.id === id);
      const target = todos[targetIndex];
      target.title = payload.title ?? target.title;
      target.description = payload.description ?? target.description;
      target.status = payload.status ?? target.status;

      window.localStorage.setItem("todos", JSON.stringify(todos));
      emitChange();

      const controller = new AbortController();
      updateSignals.current[id]?.abort();
      updateSignals.current[id] = controller;

      try {
        const res = await fetch("/api/v1/todo", {
          method: "PATCH",
          body: JSON.stringify(target),
          signal: controller.signal,
        });
        if (res.status === 200) {
          updateSignals.current[id] = undefined;
        }
      } catch (e) {
        console.log(e);
      }
    },
    [],
  );

  const deleteTodo = useCallback(async (id: Todo["id"]) => {
    let todos = JSON.parse(
      window.localStorage.getItem("todos") ?? "[]",
    ) as Todo[];
    todos = todos.filter((t) => t.id !== id);

    window.localStorage.setItem("todos", JSON.stringify(todos));
    emitChange();

    const controller = new AbortController();
    updateSignals.current[id]?.abort();
    deleteSignals.current[id]?.abort();
    deleteSignals.current[id] = controller;
    try {
      const res = await fetch("/api/v1/todo/" + id, {
        method: "DELETE",
      });
      if (res.status === 200) {
        updateSignals.current[id] = undefined;
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  const todoList_ = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const todoList = firstRender.current
    ? todos
    : (JSON.parse(todoList_) as Todo[]);

  return {
    todoList,
    addTodo,
    updateTodo,
    deleteTodo,
  };
}
