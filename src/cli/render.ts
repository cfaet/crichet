import type { CoinMarketData } from "../domain/market-data"
import type { VsCurrency } from "../domain/currency"
import { formatMoney, formatPercent, formatTimestamp } from "../domain/format"

type TableRow = ReadonlyArray<string>

const headers: TableRow = ["Coin", "Symbol", "Price", "24h %", "Market Cap", "Volume 24h", "Updated"]

const toRow = (currency: VsCurrency) => (data: CoinMarketData): TableRow => [
  data.name,
  data.symbol,
  formatMoney(data.price, currency),
  formatPercent(data.change24hPct),
  formatMoney(data.marketCap, currency),
  formatMoney(data.volume24h, currency),
  formatTimestamp(data.lastUpdatedAt)
]

const cellAt = (row: TableRow, index: number): string => row[index] ?? ""

const padCell = (widths: ReadonlyArray<number>) => (cell: string, index: number): string =>
  cell.padEnd(widths[index] ?? cell.length, " ")

const renderLine = (row: TableRow, widths: ReadonlyArray<number>): string =>
  `│ ${row.map(padCell(widths)).join(" │ ")} │`

const renderSeparator = (widths: ReadonlyArray<number>, left: string, middle: string, right: string): string =>
  `${left}${widths.map((width) => "─".repeat(width + 2)).join(middle)}${right}`

export const renderTable = (
  data: ReadonlyArray<CoinMarketData>,
  currency: VsCurrency
): string => {
  const rows = data.map(toRow(currency))
  const allRows: ReadonlyArray<TableRow> = [headers, ...rows]
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...allRows.map((row) => cellAt(row, index).length))
  )

  return [
    renderSeparator(widths, "┌", "┬", "┐"),
    renderLine(headers, widths),
    renderSeparator(widths, "├", "┼", "┤"),
    ...rows.map((row) => renderLine(row, widths)),
    renderSeparator(widths, "└", "┴", "┘")
  ].join("\n")
}

export const renderJson = (data: ReadonlyArray<CoinMarketData>): string =>
  JSON.stringify(
    data.map((item) => ({
      id: item.id,
      name: item.name,
      symbol: item.symbol,
      price: item.price,
      marketCap: item.marketCap,
      volume24h: item.volume24h,
      change24hPct: item.change24hPct,
      lastUpdatedAt: item.lastUpdatedAt.toISOString()
    })),
    null,
    2
  )
