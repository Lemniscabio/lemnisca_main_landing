import { useRef, useState } from 'react'
import { getReferenceCatalog } from '@/lib/reports/avira-references'
import type { ReferenceItem } from '@/lib/reports/avira-references'

export function useAutocomplete() {
  const [attachedRefs, setAttachedRefs] = useState<{ id: string; label: string }[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteItems, setAutocompleteItems] = useState<ReferenceItem[]>([])
  const refCatalog = useRef<ReferenceItem[]>(getReferenceCatalog())

  const handleInputChange = (val: string) => {
    const hashMatch = val.match(/#(\S*)$/)
    if (hashMatch) {
      const filter = hashMatch[1].toLowerCase()
      if (filter === '') {
        setAutocompleteItems(refCatalog.current)
        setShowAutocomplete(true)
      } else {
        const filtered = refCatalog.current.filter(
          (item) =>
            item.id.toLowerCase().includes(filter) ||
            item.label.toLowerCase().includes(filter) ||
            item.category.toLowerCase().includes(filter)
        )
        setAutocompleteItems(filtered)
        setShowAutocomplete(filtered.length > 0)
      }
    } else {
      setShowAutocomplete(false)
    }
  }

  const selectReference = (item: ReferenceItem, currentInput: string): string => {
    const newInput = currentInput.replace(/#\S*$/, '')
    setAttachedRefs((prev) => {
      if (prev.some((r) => r.id === item.id)) return prev
      return [...prev, { id: item.id, label: item.label }]
    })
    setShowAutocomplete(false)
    return newInput
  }

  const removeRef = (refId: string) => {
    setAttachedRefs((prev) => prev.filter((r) => r.id !== refId))
  }

  const attachRef = (refId: string, label: string) => {
    setAttachedRefs((prev) => {
      if (prev.some((r) => r.id === refId)) return prev
      return [...prev, { id: refId, label }]
    })
  }

  const clearRefs = () => setAttachedRefs([])

  return {
    attachedRefs,
    showAutocomplete,
    autocompleteItems,
    handleInputChange,
    selectReference,
    removeRef,
    attachRef,
    clearRefs,
  }
}
