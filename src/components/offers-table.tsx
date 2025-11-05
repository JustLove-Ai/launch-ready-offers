'use client'

import { useState, useMemo } from 'react'
import { Offer, Product, Task } from '@prisma/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns'
import { Search, Filter, X, Calendar } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'

type OfferWithProducts = Offer & {
  products: (Product & {
    tasks: Task[]
  })[]
}

interface OffersTableProps {
  offers: OfferWithProducts[]
}

export function OffersTable({ offers }: OffersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  // Extract all unique tags from offers
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    offers.forEach(offer => {
      if (offer.tags) {
        offer.tags.forEach(tag => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [offers])

  // Filter offers
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      // Search filter
      const matchesSearch = !searchQuery ||
        offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || offer.status === statusFilter

      // Tag filter
      const matchesTag = tagFilter === 'all' || (offer.tags && offer.tags.includes(tagFilter))

      // Date filter
      const matchesDateFrom = !dateFrom || isAfter(new Date(offer.createdAt), dateFrom) ||
        new Date(offer.createdAt).toDateString() === dateFrom.toDateString()
      const matchesDateTo = !dateTo || isBefore(new Date(offer.createdAt), dateTo) ||
        new Date(offer.createdAt).toDateString() === dateTo.toDateString()

      return matchesSearch && matchesStatus && matchesTag && matchesDateFrom && matchesDateTo
    })
  }, [offers, searchQuery, statusFilter, tagFilter, dateFrom, dateTo])

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setTagFilter('all')
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || tagFilter !== 'all' || dateFrom || dateTo

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="LAUNCHED">Launched</SelectItem>
            </SelectContent>
          </Select>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {dateFrom || dateTo ? 'Date Range' : 'All Dates'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From</label>
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">To</label>
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-slate-600">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary">Search: {searchQuery}</Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary">Status: {statusFilter}</Badge>
            )}
            {tagFilter !== 'all' && (
              <Badge variant="secondary">Tag: {tagFilter}</Badge>
            )}
            {dateFrom && (
              <Badge variant="secondary">From: {format(dateFrom, 'PP')}</Badge>
            )}
            {dateTo && (
              <Badge variant="secondary">To: {format(dateTo, 'PP')}</Badge>
            )}
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Value / Price</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Launch Date</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOffers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  {hasActiveFilters ? 'No offers match your filters' : 'No offers yet'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOffers.map((offer) => {
                const totalTasks = offer.products.reduce((sum, p) => sum + p.tasks.length, 0)
                const completedTasks = offer.products.reduce(
                  (sum, p) => sum + p.tasks.filter((t) => t.status === 'COMPLETED').length,
                  0
                )
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                return (
                  <TableRow key={offer.id} className="cursor-pointer hover:bg-slate-50">
                    <TableCell>
                      <Link href={`/offer/${offer.id}`} className="hover:underline font-medium">
                        {offer.name}
                      </Link>
                      {offer.topic && (
                        <p className="text-sm text-slate-500 mt-1">{offer.topic}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          offer.status === 'LAUNCHED'
                            ? 'default'
                            : offer.status === 'READY'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {offer.tags && offer.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {offer.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{offer.products.length}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">${offer.totalValue.toFixed(0)}</div>
                        <div className="text-sm text-emerald-600">${offer.price.toFixed(0)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {totalTasks > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 min-w-[60px]">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600 min-w-[3ch]">{progress}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {offer.launchDate ? (
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(offer.launchDate), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-slate-600">
        Showing {filteredOffers.length} of {offers.length} offers
      </div>
    </div>
  )
}
