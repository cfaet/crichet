import { currencySymbol, type VsCurrency } from "./currency"

export const formatMoney = (value: number | null, currency: VsCurrency): string => {
  if (value === null) {
    return "n/a"
  }

  const symbol = currencySymbol(currency)

  if (Math.abs(value) >= 1_000_000_000_000) {
    return `${symbol}${(value / 1_000_000_000_000).toFixed(2)}T`
  }

  if (Math.abs(value) >= 1_000_000_000) {
    return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`
  }

  if (Math.abs(value) >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(2)}M`
  }

  return `${symbol}${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value < 1 ? 4 : 2
  })}`
}

export const formatPercent = (value: number | null): string => {
  if (value === null) {
    return "n/a"
  }

  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

export const formatTimestamp = (date: Date): string => date.toISOString()
