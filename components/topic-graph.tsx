'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from './ui/card'

interface TopicGraphProps {
  currentTopic: string
  similarTopics: Array<{ name: string; description?: string }>
}

export function TopicGraph({ currentTopic, similarTopics }: TopicGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [colors, setColors] = useState<{
    primary: string
    muted: string
    foreground: string
    border: string
  }>({
    primary: '#6d28d9',
    muted: '#f3f4f6',
    foreground: '#1f2937',
    border: '#e5e7eb',
  })
  
  // Get CSS variables on mount
  useEffect(() => {
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)
    
    const getPrimaryColor = () => {
      const hsl = computedStyle.getPropertyValue('--primary').trim()
      if (hsl) {
        const [h, s, l] = hsl.split(' ').map((v) => v.replace('%', ''))
        return `hsl(${h}, ${s}%, ${l}%)`
      }
      return '#6d28d9'
    }

    setColors({
      primary: getPrimaryColor(),
      muted: '#f3f4f6',
      foreground: '#1f2937',
      border: '#e5e7eb',
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
    }> = [
      {
        x: centerX,
        y: centerY,
        name: currentTopic,
        isCurrent: true,
        radius: 40,
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
        const targetX = nodes[0].x + (nodes[i].x - nodes[0].x) * animationProgress
        const targetY = nodes[0].y + (nodes[i].y - nodes[0].y) * animationProgress
          // Convert colors.primary (hsl or hex) to hsla for alpha
          let colorStart = colors.primary
          let colorEnd = colors.primary
          // If hsl, convert to hsla
          if (colorStart.startsWith('hsl(')) {
            colorStart = colorStart.replace('hsl(', 'hsla(').replace(')', ', 0.4)')
            colorEnd = colorEnd.replace('hsl(', 'hsla(').replace(')', ', 0.2)')
          } else {
            // fallback for hex
            colorStart = colorStart + '66' // #RRGGBB66
            colorEnd = colorEnd + '33'
          }
          const gradient = ctx.createLinearGradient(nodes[0].x, nodes[0].y, targetX, targetY)
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

        // Node circle with gradient
        if (node.isCurrent) {
          // Helper to convert hsl() to hsla()
          const hslaColor = (hsl: string, alpha: number) => {
            if (hsl.startsWith('hsl(')) {
              return hsl.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`)
            }
            return hsl // fallback for hex
          }
          const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, currentRadius
          )
          gradient.addColorStop(0, hslaColor(colors.primary, 1))
          gradient.addColorStop(1, hslaColor(colors.primary, 0.7))
          ctx.fillStyle = gradient
        } else {
          ctx.fillStyle = colors.muted
        }
        
        ctx.beginPath()
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()

        // Node border
        ctx.strokeStyle = node.isCurrent ? '#ffffff' : colors.border
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.shadowBlur = 0

        // Text with better rendering: scale font to node radius and truncate long labels
        ctx.fillStyle = node.isCurrent ? '#ffffff' : colors.foreground
        // Compute a font size based on radius (clamped)
        const baseFontSize = Math.max(9, Math.min(16, Math.floor(currentRadius * (node.isCurrent ? 0.28 : 0.30))))
        const fontWeight = node.isCurrent ? 'bold ' : ''
        ctx.font = `${fontWeight}${baseFontSize}px system-ui, -apple-system, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const maxWidth = currentRadius * 1.6
        const maxLines = node.isCurrent ? 3 : 2
        const words = node.name.split(' ')
        const lines: string[] = []
        let line = ''

        for (let w = 0; w < words.length; w++) {
          const word = words[w]
          const testLine = line ? line + ' ' + word : word
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth) {
            if (line === '') {
              // single long word: truncate it to fit
              let truncated = word
              while (ctx.measureText(truncated + '…').width > maxWidth && truncated.length > 0) {
                truncated = truncated.slice(0, -1)
              }
              lines.push(truncated + '…')
            } else {
              lines.push(line)
              line = word
            }
            if (lines.length === maxLines) {
              // we've hit the max lines: squash the rest into the last line and truncate
              const remaining = [line].concat(words.slice(w + 1)).filter(Boolean).join(' ')
              let candidate = (lines[lines.length - 1] + ' ' + remaining).trim()
              while (ctx.measureText(candidate + '…').width > maxWidth && candidate.length > 0) {
                candidate = candidate.slice(0, -1)
              }
              lines[lines.length - 1] = candidate + '…'
              line = ''
              break
            }
          } else {
            line = testLine
          }
        }
        if (line && lines.length < maxLines) lines.push(line)

        const lineHeight = Math.max(12, baseFontSize + 2)
        const startY = node.y - ((lines.length - 1) * lineHeight) / 2

        lines.forEach((textLine, idx) => {
          ctx.fillText(textLine, node.x, startY + idx * lineHeight)
        })
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

    canvas.addEventListener('mousemove', handleMouseMove)
    
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
      window.removeEventListener('resize', handleResize)
    }
  }, [currentTopic, similarTopics, hoveredNode, colors])

  return (
    <Card className="p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-primary">Powiązane tematy</h3>
        <p className="text-xs text-muted-foreground">
          Graf semantycznych podobieństw
        </p>
      </div>
      <canvas
        ref={canvasRef}
        className="h-[400px] w-full"
        style={{ width: '100%', height: '400px' }}
      />
      
    </Card>
  )
}
