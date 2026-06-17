export const supportedCurrencies = ["usd", "eur", "pen"] as const

export type VsCurrency = (typeof supportedCurrencies)[number]

const currencySymbols: Record<VsCurrency, string> = {
  usd: "$",
  eur: "€",
  pen: "S/"
}

export const currencySymbol = (currency: VsCurrency): string => currencySymbols[currency]
