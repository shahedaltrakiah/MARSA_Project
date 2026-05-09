import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProjectRootPage({ params }: Props) {
  const { id } = await params
  redirect(`/app/projects/${id}/progress`)
}
