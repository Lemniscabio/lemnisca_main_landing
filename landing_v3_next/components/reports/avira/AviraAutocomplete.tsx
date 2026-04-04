'use client'

import type { ReferenceItem } from '@/lib/reports/avira-references'

interface AviraAutocompleteProps {
  items: ReferenceItem[]
  onSelect: (item: ReferenceItem) => void
}

export function AviraAutocomplete({ items, onSelect }: AviraAutocompleteProps) {
  return (
    <div className="avira-autocomplete">
      {items.slice(0, 8).map((item) => (
        <button
          key={item.id}
          className="avira-autocomplete-item"
          onClick={() => onSelect(item)}
        >
          <span className={`avira-ref-cat avira-ref-cat-${item.category}`}>{item.category}</span>
          <span className="avira-autocomplete-label">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
