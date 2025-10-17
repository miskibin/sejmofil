'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Card } from './ui/card'

interface TopicGraphProps {
  currentTopic: string
  currentTopicId: string
  similarTopics: Array<{ name: string; description?: string; id: string }>
}

export function TopicGraph({
  currentTopic,
  currentTopicId,
  similarTopics,
}: TopicGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const router = useRouter()
  const [colors, setColors] = useState<{
    primary: string
    primaryForeground: string
    muted: string
    foreground: string
    border: string
  }>({
    primary: 'hsl(262.1 83.3% 57.8%)',
    primaryForeground: 'hsl(210 40% 98%)',
    muted: 'hsl(210 40% 96.1%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    border: 'hsl(214.3 31.8% 91.4%)',
  })

  // Get CSS variables on mount
  useEffect(() => {
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)

    const getHslValue = (variable: string, fallback: string) => {
      const value = computedStyle.getPropertyValue(variable).trim()
      return value ? `hsl(${value})` : fallback
    }

    setColors({
      primary: getHslValue('--primary', 'hsl(262.1 83.3% 57.8%)'),
      primaryForeground: getHslValue(
        '--primary-foreground',
        'hsl(210 40% 98%)'
      ),
      muted: getHslValue('--muted', 'hsl(210 40% 96.1%)'),
      foreground: getHslValue('--foreground', 'hsl(222.2 84% 4.9%)'),
      border: getHslValue('--border', 'hsl(214.3 31.8% 91.4%)'),
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || similarTopics.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height / 2

    // Central node
    const nodes: Array<{
      x: number
      y: number
      name: string
      isCurrent: boolean
      radius: number
      id?: string
    }> = [
      {
        x: centerX,
        y: centerY,
        name: currentTopic,
        isCurrent: true,
        radius: 40,
        id: currentTopicId,
      },
    ]

    // Similar topic nodes in circle
    const angleStep = (Math.PI * 2) / similarTopics.length
    const radius = Math.min(width, height) * 0.32

    similarTopics.forEach((topic, i) => {
      const angle = angleStep * i - Math.PI / 2
      nodes.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        name: topic.name,
        isCurrent: false,
        radius: 28,
        id: topic.id,
      })
    })

    // Animation
    let animationProgress = 0
    const animate = () => {
      if (animationProgress < 1) {
        animationProgress += 0.02
        requestAnimationFrame(animate)
      }

      ctx.clearRect(0, 0, width, height)

      // Draw connections with gradient
      for (let i = 1; i < nodes.length; i++) {
        const targetX =
          nodes[0].x + (nodes[i].x - nodes[0].x) * animationProgress
        const targetY =
          nodes[0].y + (nodes[i].y - nodes[0].y) * animationProgress
        // Convert hsl to hsla for canvas (needs comma-separated values)
        const hslToHsla = (hsl: string, alpha: number) => {
          const match = hsl.match(/hsl\(([^)]+)\)/)
          if (match) {
            // Convert space-separated to comma-separated for canvas
            const values = match[1]
              .trim()
              .split(/\s+/)
              .join(', ')
            return `hsla(${values}, ${alpha})`
          }
          return hsl
        }
        const colorStart = hslToHsla(colors.primary, 0.4)
        const colorEnd = hslToHsla(colors.primary, 0.2)
        const gradient = ctx.createLinearGradient(
          nodes[0].x,
          nodes[0].y,
          targetX,
          targetY
        )
        gradient.addColorStop(0, colorStart)
        gradient.addColorStop(1, colorEnd)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(nodes[0].x, nodes[0].y)
        ctx.lineTo(targetX, targetY)
        ctx.stroke()
      }

      // Draw nodes
      nodes.forEach((node, i) => {
        const scale = i === 0 ? 1 : animationProgress
        const currentRadius = node.radius * scale

        if (currentRadius < 1) return

        // Glow effect for hovered node
        if (hoveredNode === node.name) {
          ctx.shadowBlur = 15
          ctx.shadowColor = colors.primary
        } else {
          ctx.shadowBlur = 0
        }

        // Helper to convert hsl to canvas-compatible format
        const hslToCanvasColor = (hsl: string) => {
          const match = hsl.match(/hsl\(([^)]+)\)/)
          if (match) {
            // Convert space-separated to comma-separated for canvas
            const values = match[1]
              .trim()
              .split(/\s+/)
              .join(', ')
            return `hsl(${values})`
          }
          return hsl
        }

        const hslToHsla = (hsl: string, alpha: number) => {
          const match = hsl.match(/hsl\(([^)]+)\)/)
          if (match) {
            const values = match[1]
              .trim()
              .split(/\s+/)
              .join(', ')
            return `hsla(${values}, ${alpha})`
          }
          return hsl
        }

        // Only draw circles for the current (central) topic
        if (node.isCurrent) {
          // Node circle with gradient
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            currentRadius
          )
          gradient.addColorStop(0, hslToHsla(colors.primary, 1))
          gradient.addColorStop(1, hslToHsla(colors.primary, 0.7))
          ctx.fillStyle = gradient

          ctx.beginPath()
          ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2)
          ctx.fill()

          // Node border
          ctx.strokeStyle = hslToCanvasColor(colors.primaryForeground)
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.shadowBlur = 0
        }

        // Text with proper wrapping and truncation
        ctx.fillStyle = node.isCurrent
          ? hslToCanvasColor(colors.primaryForeground)
          : hslToCanvasColor(colors.foreground)
        const baseFontSize = node.isCurrent ? 13 : 12
        const fontWeight = node.isCurrent ? '600 ' : '500 '
        ctx.font = `${fontWeight}${baseFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const maxWidth = node.isCurrent ? currentRadius * 1.8 : 120
        const maxLines = node.isCurrent ? 2 : 3
        const words = node.name.trim().split(' ')
        const lines: string[] = []
        let line = ''

        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word
          const metrics = ctx.measureText(testLine)

          if (metrics.width > maxWidth && line !== '') {
            lines.push(line)
            line = word
          } else {
            line = testLine
          }

          if (lines.length >= maxLines) {
            // Trim last line if needed
            if (ctx.measureText(line).width > maxWidth) {
              while (
                ctx.measureText(line + '...').width > maxWidth &&
                line.length > 0
              ) {
                line = line.slice(0, -1)
              }
              line = line.trim() + '...'
            }
            break
          }
        }

        if (line && lines.length < maxLines) {
          lines.push(line)
        }

        const lineHeight = baseFontSize + 4
        const startY = node.y - ((lines.length - 1) * lineHeight) / 2

        lines.forEach((textLine, idx) => {
          ctx.fillText(textLine, node.x, startY + idx * lineHeight)
        })

        // Store text bounds for click detection (wider area for non-current nodes)
        if (!node.isCurrent) {
          const textHeight = lines.length * lineHeight
          node.radius = Math.max(60, Math.max(maxWidth / 2, textHeight / 2))
        }
      })
    }

    animate()

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      let found = false
      for (const node of nodes) {
        const dx = x - node.x
        const dy = y - node.y
        if (Math.sqrt(dx * dx + dy * dy) <= node.radius) {
          setHoveredNode(node.name)
          canvas.style.cursor = 'pointer'
          found = true
          break
        }
      }

      if (!found) {
        setHoveredNode(null)
        canvas.style.cursor = 'default'
      }
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      for (const node of nodes) {
        const dx = x - node.x
        const dy = y - node.y
        if (Math.sqrt(dx * dx + dy * dy) <= node.radius && node.id) {
          router.push(`/topics/${node.id}`)
          break
        }
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)

    // Handle window resize
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      if (ctx) ctx.scale(dpr, dpr)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
    }
  }, [currentTopic, currentTopicId, similarTopics, hoveredNode, colors, router])

  return (
    <canvas
      ref={canvasRef}
      className="h-[400px] w-full"
      style={{ width: '100%', height: '400px' }}
    />
  )
}
