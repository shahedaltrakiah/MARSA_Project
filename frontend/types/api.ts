export type AdminSiteSection = 'branding' | 'hero' | 'features' | 'pricing'

export interface User {
  id: number
  name: string
  email: string
  /** ISO datetime when email was verified; null until user confirms via link */
  email_verified_at?: string | null
  role: 'user' | 'admin' | 'super_admin'
  created_at: string
  /** Present when `role` is `admin` — which marketing site editor sections this staff user may change. */
  admin_site_permissions?: AdminSiteSection[] | null
}

export interface AuthResponse {
  user: User
  token: string
  /** Present when registration completed a pending project invitation */
  meta?: {
    joined_project_id?: number
  }
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
  | 'reach'
  | 'customer'
  | 'money'
  | 'assets'
  | 'action'
  | 'targets'

export type ReachPillar = 'business_model' | 'branding' | 'marketing' | 'sales'
export type TargetsPillar = 'cash' | 'position' | 'awareness' | 'value'

/** One bullet in a framework subsection workspace (flat sections). */
export type WorkspacePoint = {
  id: string
  text: string
  starred?: boolean
  /** ISO date `YYYY-MM-DD` — reserved for targets integration */
  target_date?: string | null
}

/** Rich notes + structured points for one tab inside Offering, Customer, etc. */
export type WorkspaceSubsectionData = {
  notes: string
  points: WorkspacePoint[]
}

export type ProjectSectionContent = Record<
  string,
  string | Record<string, string> | WorkspaceSubsectionData
>

export type CollaboratorRole = 'editor' | 'viewer'

export interface ProjectCollaborator {
  id: number
  name: string
  email: string
  role: CollaboratorRole
}

export type ProjectIdeaProfileFile = {
  url: string
  original_name: string
}

export type ProjectIdeaProfileData = {
  business_category?: string
  /** @deprecated legacy free-text; prefer business_audience */
  business_type?: string
  /** B2B / B2C / both — stored as `b2b` | `b2c` | `both` */
  business_audience?: string
  stage?: string
  core_idea?: string
  problem?: string
  solution?: string
  customer_market?: string
  team?: string
  traction?: string
  current_challenge?: string
  goal_3m?: string
  files?: ProjectIdeaProfileFile[]
}

export interface Project {
  id: number
  name: string
  logo: string | null
  description: string | null
  idea_profile?: ProjectIdeaProfileData | null
  idea_profile_completed_at?: string | null
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
