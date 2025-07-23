export interface Vacation {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  imageUrl?: string
  createdBy: string
  createdAt: string
  participants: VacationParticipant[]
}

export interface VacationParticipant {
  username: string
  role: "admin" | "member"
  joinedAt: string
}
