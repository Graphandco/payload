'use client'

import { useLayoutEffect, useState } from 'react'

/**
 * Hauteur du header `.default-header` + offset, pour positionner un sticky sous le header.
 */
export function useHeaderHeight(offset = 0): number {
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>('.default-header')
    if (!header) {
      return
    }

    const update = () => setHeight(header.offsetHeight + offset)

    update()

    const observer = new ResizeObserver(update)
    observer.observe(header)

    return () => observer.disconnect()
  }, [offset])

  return height
}
