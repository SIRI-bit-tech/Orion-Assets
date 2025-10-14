"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
}

interface SymbolSearchProps {
  onSelect: (symbol: string) => void
  placeholder?: string
  className?: string
}

export function SymbolSearch({ onSelect, placeholder = "Search symbols...", className }: SymbolSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchSymbols = async () => {
      if (query.length < 1) {
        setResults([])
        setIsOpen(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results)
          setIsOpen(true)
        }
      } catch (error) {
        console.error("[v0] Error searching symbols:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchSymbols, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (symbol: string) => {
    onSelect(symbol)
    setQuery("")
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 p-2 max-h-80 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result.symbol)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{result.symbol}</p>
                  <p className="text-sm text-muted-foreground">{result.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{result.exchange}</p>
                  <p className="text-xs text-muted-foreground">{result.type}</p>
                </div>
              </div>
            </button>
          ))}
        </Card>
      )}

      {isOpen && loading && (
        <Card className="absolute z-50 w-full mt-2 p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </Card>
      )}

      {isOpen && !loading && results.length === 0 && query.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 p-4 text-center text-muted-foreground">No symbols found</Card>
      )}
    </div>
  )
}
