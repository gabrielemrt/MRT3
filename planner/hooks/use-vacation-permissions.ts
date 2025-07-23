"use client"

import { useMemo } from "react"
import type { Vacation } from "@/app/page"

export function useVacationPermissions(vacation: Vacation | null, currentUser: string) {
  const permissions = useMemo(() => {
    if (!vacation || !currentUser) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canManageParticipants: false,
        canAddContent: false,
        isParticipant: false,
        isVacationAdmin: false,
        userRole: null as "admin" | "member" | null,
      }
    }

    // Trova il partecipante corrente
    const participant = vacation.participants?.find((p) => p.username === currentUser)
    const isParticipant = !!participant
    const isVacationAdmin = participant?.role === "admin"
    const isCreator = vacation.createdBy === currentUser

    // Controlla se l'utente è admin del sistema
    const savedUsers = localStorage.getItem("users")
    let isSystemAdmin = false
    if (savedUsers) {
      const users = JSON.parse(savedUsers)
      const user = users.find((u: any) => u.username === currentUser)
      isSystemAdmin = user?.role === "admin"
    }

    return {
      canView: isParticipant || isSystemAdmin,
      canEdit: isVacationAdmin || isSystemAdmin,
      canDelete: isCreator || isSystemAdmin,
      canManageParticipants: isVacationAdmin || isSystemAdmin,
      canAddContent: isParticipant || isSystemAdmin,
      isParticipant,
      isVacationAdmin,
      userRole: participant?.role || null,
    }
  }, [vacation, currentUser])

  return permissions
}
