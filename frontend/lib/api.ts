const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Question {
  id: number;
  question_text: string;
  opt_a: string;
  opt_b: string;
  opt_c: string;
  opt_d: string;
  category: string;
  difficulty: string;
  correct_ans?: string;
}

export interface ExamSession {
  id: number;
  score: number;
  total: number;
  category: string;
  taken_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cg_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<{ access_token: string; user: User }>("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/me"),

  getQuestions: (category?: string) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return request<Question[]>(`/questions${query}`);
  },

  getCategories: () => request<string[]>("/categories"),

  getQuestionAnswer: (questionId: number) =>
    request<{ correct_ans: string }>(`/questions/${questionId}`),

  saveSession: (data: { score: number; total: number; category: string }) =>
    request<ExamSession>("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  mySessions: () => request<ExamSession[]>("/sessions"),
};
