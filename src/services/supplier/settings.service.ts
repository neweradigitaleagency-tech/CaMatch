import { MOCK_TEAM_MEMBERS, MOCK_SESSIONS } from "../../data/supplier-mocks"
import type { TeamMember, ActiveSession } from "../../types/supplier"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  await delay(200)
  return MOCK_TEAM_MEMBERS
}

export async function fetchTeamMembersBySupplier(supplierId: string): Promise<TeamMember[]> {
  await delay(200)
  return MOCK_TEAM_MEMBERS.filter((m) => m.supplierId === supplierId)
}

export async function fetchSessions(userId: string): Promise<ActiveSession[]> {
  await delay(150)
  return MOCK_SESSIONS.filter((s) => s.userId === userId)
}

export async function fetchSessionCount(userId: string): Promise<number> {
  await delay(100)
  return MOCK_SESSIONS.filter((s) => s.userId === userId).length
}
