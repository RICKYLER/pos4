"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Download } from "lucide-react"
import { useDataStore } from "@/lib/data-store"

interface SalesTransactionsTableProps {
  limit?: number
}

export function SalesTransactionsTable({ limit }: SalesTransactionsTableProps) {
  const { sales } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [showAll, setShowAll] = useState(false)

  const filteredSales = sales
    .filter((sale) => {
      const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPayment = paymentFilter === "all" || sale.paymentMethod === paymentFilter
      return matchesSearch && matchesPayment
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const displayedSales = limit && !showAll ? filteredSales.slice(0, limit) : filteredSales

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800"
      case "card":
        return "bg-blue-100 text-blue-800"
      case "digital":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportToCSV = () => {
    const headers = ["Transaction ID", "Date", "Items", "Total", "Payment Method", "Cashier"]
    const csvData = filteredSales.map((sale) => [
      sale.id,
      new Date(sale.createdAt).toLocaleString(),
      sale.items.length,
      sale.total.toFixed(2),
      sale.paymentMethod,
      sale.cashierId,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Sales Transactions ({filteredSales.length})</CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-sm">#{sale.id.slice(-6)}</TableCell>
                  <TableCell className="text-sm">
                    <div>{new Date(sale.createdAt).toLocaleDateString()}</div>
                    <div className="text-gray-500">
                      {new Date(sale.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sale.items.reduce((sum, item) => sum + item.quantity, 0)} units
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">${sale.subtotal.toFixed(2)}</TableCell>
                  <TableCell className="font-mono">${sale.tax.toFixed(2)}</TableCell>
                  <TableCell className="font-mono font-medium">${sale.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getPaymentMethodColor(sale.paymentMethod)}>
                      {sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {displayedSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">No transactions found matching your criteria.</div>
          )}
        </div>

        {/* Show More Button */}
        {limit && filteredSales.length > limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : `Show All (${filteredSales.length} total)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
