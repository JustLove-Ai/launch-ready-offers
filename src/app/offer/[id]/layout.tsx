import { getOfferById } from '@/actions/offer-actions'
import { notFound } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { OfferSidebar } from '@/components/offer-sidebar'
import { Separator } from '@/components/ui/separator'
import { OfferHeader } from '@/components/offer-header'

export default async function OfferLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getOfferById(id)

  if (!result.success || !result.offer) {
    notFound()
  }

  return (
    <SidebarProvider>
      <OfferSidebar offer={result.offer} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-xl font-semibold text-slate-900">{result.offer.name}</h1>
          </div>
          <OfferHeader offer={result.offer} />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
