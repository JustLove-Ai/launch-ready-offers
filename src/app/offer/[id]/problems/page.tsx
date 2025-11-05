import { getOfferById } from '@/actions/offer-actions'
import { getProblemsByOffer } from '@/actions/problem-actions'
import { notFound } from 'next/navigation'
import { ProblemsView } from '@/components/problems-view'

export default async function ProblemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [offerResult, problemsResult] = await Promise.all([
    getOfferById(id),
    getProblemsByOffer(id),
  ])

  if (!offerResult.success || !offerResult.offer) {
    notFound()
  }

  const problems = problemsResult.success ? problemsResult.problems || [] : []

  return <ProblemsView offer={offerResult.offer} initialProblems={problems} />
}
