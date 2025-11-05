'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Package, ListChecks, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { Offer } from '@prisma/client'

interface OfferSidebarProps {
  offer: Offer
}

export function OfferSidebar({ offer }: OfferSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: 'Products & Bonuses',
      icon: Package,
      href: `/offer/${offer.id}/products`,
    },
    {
      title: 'Problems & Solutions',
      icon: Target,
      href: `/offer/${offer.id}/problems`,
    },
    {
      title: 'Launch Tasks',
      icon: ListChecks,
      href: `/offer/${offer.id}/tasks`,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="space-y-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Offers
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{offer.name}</h2>
            {offer.topic && <p className="text-sm text-slate-600">{offer.topic}</p>}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
