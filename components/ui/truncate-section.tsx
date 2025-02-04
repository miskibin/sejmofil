'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { ChevronDown } from 'lucide-react'

function TruncateSection({
  height,
  children,
}: {
  height: number
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isOverflowing, setIsOverflowing] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      // add 30 pixels so that we dont have a case where  for example
      // the height limit is 200 and the content is 203, expanding section
      // in that case would cause only 3 pixels to be expanded
      setIsOverflowing(contentRef.current.scrollHeight > height + 30)
    }
  }, [children, height])

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          height:
            isCollapsed && isOverflowing
              ? `${height}px`
              : contentRef?.current
                ? `${contentRef.current.scrollHeight + 40}px`
                : 'unset',
        }}
      >
        {children}
      </div>

      {isCollapsed && isOverflowing && (
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      )}

      {/* TODO improve styling */}
      {isOverflowing && (
        <Button
          className="absolute right-1 bottom-1 rounded-full"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronDown
            className={`transition-all duration-500 ease-in-out ${isCollapsed ? '' : 'rotate-180'}`}
          />
        </Button>
      )}
    </div>
  )
}

export { TruncateSection }
