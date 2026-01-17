export interface Country {
  code: string
  name: string
  currency: string
  currencySymbol: string
}

export const countries: Country[] = [
  { code: "US", name: "United States", currency: "USD", currencySymbol: "$" },
  { code: "GB", name: "United Kingdom", currency: "GBP", currencySymbol: "£" },
  { code: "EU", name: "European Union", currency: "EUR", currencySymbol: "€" },
  { code: "IN", name: "India", currency: "INR", currencySymbol: "₹" },
  { code: "JP", name: "Japan", currency: "JPY", currencySymbol: "¥" },
  { code: "CN", name: "China", currency: "CNY", currencySymbol: "¥" },
  { code: "CA", name: "Canada", currency: "CAD", currencySymbol: "$" },
  { code: "AU", name: "Australia", currency: "AUD", currencySymbol: "$" },
  { code: "BR", name: "Brazil", currency: "BRL", currencySymbol: "R$" },
  { code: "MX", name: "Mexico", currency: "MXN", currencySymbol: "$" },
  { code: "KR", name: "South Korea", currency: "KRW", currencySymbol: "₩" },
  { code: "SG", name: "Singapore", currency: "SGD", currencySymbol: "$" },
  { code: "CH", name: "Switzerland", currency: "CHF", currencySymbol: "Fr" },
  { code: "SE", name: "Sweden", currency: "SEK", currencySymbol: "kr" },
  { code: "NO", name: "Norway", currency: "NOK", currencySymbol: "kr" },
  { code: "DK", name: "Denmark", currency: "DKK", currencySymbol: "kr" },
  { code: "NZ", name: "New Zealand", currency: "NZD", currencySymbol: "$" },
  { code: "ZA", name: "South Africa", currency: "ZAR", currencySymbol: "R" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", currencySymbol: "د.إ" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", currencySymbol: "﷼" },
]

export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code)
}

export function getCurrencySymbol(currency: string): string {
  const country = countries.find((c) => c.currency === currency)
  return country?.currencySymbol || "$"
}
