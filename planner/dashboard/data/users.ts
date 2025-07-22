export interface User {
  username: string
  password: string
  role: "admin" | "member"
}

export const users: User[] = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    username: "gabriele",
    password: "gab123",
    role: "member",
  },
  {
    username: "marco",
    password: "mar123",
    role: "member",
  },
  {
    username: "sara",
    password: "sar123",
    role: "member",
  },
  {
    username: "luca",
    password: "luc123",
    role: "member",
  },
]
