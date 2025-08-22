"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDataStore } from "@/lib/data-store"
import { TrendingUp, TrendingDown, RotateCcw, Calendar } from "lucide-react"
import type { StockMovement } from "@/types"

interface StockMovementHistoryProps {
  productId?: string
}

export function StockMovementHistory({ productId }: StockMovementHistoryProps) {
  const { stockMovements, products } = useDataStore()
  const [showAll, setShowAll] = useState(false)

  const filteredMovements = productId
    ? stockMovements.filter((movement) => movement.productId === productId)
    : stockMovements

  const sortedMovements = [...filteredMovements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, showAll ? undefined : 10)

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product?.name || "Unknown Product"
  }

  const getMovementIcon = (type: StockMovement["type"]) => {
    switch (type) {
      case "in":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "out":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "adjustment":
        return <RotateCcw className="h-4 w-4 text-blue-600" />
    }
  }

  const getMovementColor = (type: StockMovement["type"]) => {
    switch (type) {
      case "in":
        return "bg-green-100 text-green-800"
      case "out":
        return "bg-red-100 text-red-800"
      case "adjustment":
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Stock Movement History
          {productId && <Badge variant="secondary">{getProductName(productId)}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedMovements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No stock movements recorded yet.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {!productId && <TableHead>Product</TableHead>}
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm">
                        {new Date(movement.createdAt).toLocaleDateString()}{" "}
                        {new Date(movement.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      {!productId && (
                        <TableCell className="font-medium">{getProductName(movement.productId)}</TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          <Badge className={getMovementColor(movement.type)}>
                            {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {movement.quantity > 0 ? "+" : ""}
                        {movement.quantity}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{movement.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredMovements.length > 10 && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                  {showAll ? "Show Less" : `Show All (${filteredMovements.length} total)`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
