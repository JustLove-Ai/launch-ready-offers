import { getOfferById } from '@/actions/offer-actions'
import { notFound } from 'next/navigation'
import { TasksView } from '@/components/tasks-view'

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getOfferById(id)

  if (!result.success || !result.offer) {
    notFound()
  }

  return <TasksView offer={result.offer} />
}
