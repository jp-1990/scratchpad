export type Todo = {
  id: string;
  title: string;
  description: string;
  status: "done" | "pending";
};

export type NewTodoPayload = Pick<Todo, "title" | "description">;
export type UpdateTodoPayload = Partial<
  Pick<Todo, "title" | "description" | "status">
>;
