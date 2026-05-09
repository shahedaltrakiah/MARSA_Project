import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

/** Project metrics live on Framework progress (`/progress`); keep URL for bookmarks. */
export default async function ProjectDashboardRedirect({ params }: Props) {
  const { id } = await params
  redirect(`/app/projects/${id}/progress`)
}
