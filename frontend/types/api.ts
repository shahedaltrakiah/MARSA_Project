export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

export type StartupStage =
  | 'idea'
  | 'validation'
  | 'mvp'
  | 'early_traction'
  | 'scaling'

export interface ProfileFile {
  id: number
  original_name: string
  mime_type: string
  size: number
  created_at: string
}

export interface StartupProfile {
  id: number
  idea: string | null
  problem: string | null
  solution: string | null
  customer: string | null
  stage: StartupStage | null
  team: string | null
  traction: string | null
  challenges: string | null
  goals: string | null
  files: ProfileFile[]
  updated_at: string
}

export type ProjectSectionName =
  | 'offering'
  | 'business-model'
  | 'customer'
  | 'money'
  | 'assets'
  | 'action'

export type ProjectSectionContent = Record<string, string>

export type CollaboratorRole = 'editor' | 'viewer'

export interface ProjectCollaborator {
  id: number
  name: string
  email: string
  role: CollaboratorRole
}

export interface Project {
  id: number
  name: string
  logo: string | null
  description: string | null
  owner: User
  last_modified_by: User | null
  collaborators?: ProjectCollaborator[]
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiListResponse<T> {
  data: T[]
}

export interface ValidationErrors {
  message: string
  errors: Record<string, string[]>
}
