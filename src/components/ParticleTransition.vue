<template>
  <transition
    name="particle"
    mode="out-in"
    @before-leave="beforeLeave"
    @leave="leave"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
  >
    <slot></slot>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  element?: HTMLElement
}

export default defineComponent({
  name: 'ParticleTransition',
  setup() {
    const particles: Particle[] = []
    let animationId: number
    let canvas: HTMLCanvasElement
    let ctx: CanvasRenderingContext2D
    let isAnimating = false

    const createCanvas = () => {
      canvas = document.createElement('canvas')
      canvas.style.position = 'fixed'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.width = '100vw'
      canvas.style.height = '100vh'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '9999'
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx = canvas.getContext('2d')!
      document.body.appendChild(canvas)
    }

    const removeCanvas = () => {
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
    }

    const createParticlesFromElement = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect()
      
      // Much more conservative particle count for better performance
      const screenSize = window.innerWidth * window.innerHeight
      const elementSize = rect.width * rect.height
      const baseParticles = Math.floor(elementSize / 5000) // Reduced from 1000
      const maxParticles = screenSize < 800000 ? 20 : 40 // Reduced significantly
      const minParticles = screenSize < 800000 ? 5 : 10  // Reduced significantly
      
      const numParticles = Math.min(maxParticles, Math.max(minParticles, baseParticles))
      
      // Element center for outward movement
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Monochrome color scheme
      const colors = ['#FFFFFF', '#F2F2F2', '#CCCCCC', '#888888']
      
      for (let i = 0; i < numParticles; i++) {
        const particleX = rect.left + Math.random() * rect.width
        const particleY = rect.top + Math.random() * rect.height
        
        // Calculate outward direction from center
        const dx = particleX - centerX
        const dy = particleY - centerY
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        // Normalize and apply velocity (outward direction)
        const speed = 3 + Math.random() * 3
        const vx = (dx / distance) * speed
        const vy = (dy / distance) * speed
        
        const particle: Particle = {
          id: Date.now() + Math.random(),
          x: particleX,
          y: particleY,
          vx: vx,
          vy: vy,
          size: Math.random() * 1.5 + 0.5, // Even smaller particles
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 1,
          element
        }
        particles.push(particle)
      }
    }

    const animateParticles = (type: 'dissolve' | 'gather', targetElement?: HTMLElement) => {
      if (!ctx) return

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        for (let i = particles.length - 1; i >= 0; i--) {
          const particle = particles[i]

          if (type === 'dissolve') {
            // Dissolve animation - particles fly away and fade quickly but smoothly
            particle.x += particle.vx
            particle.y += particle.vy
            particle.opacity -= 0.08 // Faster fade for 1-second animation
            particle.vx *= 0.94 // Faster deceleration for shorter animation
            particle.vy *= 0.94 // Faster deceleration for shorter animation

            if (particle.opacity <= 0) {
              particles.splice(i, 1)
              continue
            }
          } else if (type === 'gather' && targetElement) {
            // Gather animation - particles move toward center quickly but smoothly
            const rect = targetElement.getBoundingClientRect()
            const targetCenterX = rect.left + rect.width / 2
            const targetCenterY = rect.top + rect.height / 2

            const dx = targetCenterX - particle.x
            const dy = targetCenterY - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 20) {
              particles.splice(i, 1)
              continue
            }

            // Move toward center with faster speed for 1-second animation
            const speed = 0.25 + (1 / (distance + 1)) * 0.15
            particle.vx = dx * speed
            particle.vy = dy * speed
            particle.x += particle.vx
            particle.y += particle.vy
            particle.opacity = Math.min(1, particle.opacity + 0.08)
          }

          // Draw particle with simplified rendering for better performance
          ctx.globalAlpha = particle.opacity
          ctx.fillStyle = particle.color
          
          // Simple particle with minimal glow
          ctx.shadowBlur = 3
          ctx.shadowColor = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          
          // Reset shadow
          ctx.shadowBlur = 0
          ctx.globalAlpha = 1
        }

        if (particles.length > 0) {
          animationId = requestAnimationFrame(animate)
        } else {
          isAnimating = false
          removeCanvas()
        }
      }

      animate()
    }

    const getAllVisibleElements = (element: HTMLElement): HTMLElement[] => {
      const elements: HTMLElement[] = []
      
      const traverse = (el: HTMLElement) => {
        const style = getComputedStyle(el)
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
          if (el.offsetWidth > 0 && el.offsetHeight > 0) {
            elements.push(el)
          }
          Array.from(el.children).forEach(child => traverse(child as HTMLElement))
        }
      }
      
      traverse(element)
      return elements
    }

    const beforeLeave = (el: HTMLElement) => {
      createCanvas()
      
      // Create particles from all visible elements
      const visibleElements = getAllVisibleElements(el)
      visibleElements.forEach(element => {
        if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
          createParticlesFromElement(element)
        }
      })
    }

    const leave = (el: HTMLElement, done: () => void) => {
      el.style.opacity = '0'
      
      // Start dissolve animation
      if (particles.length > 0) {
        isAnimating = true
        animateParticles('dissolve')
        
        // Fast but smooth animation completion
        setTimeout(() => {
          done()
        }, 400) // Reduced from 600ms
      } else {
        done()
      }
    }

    const beforeEnter = (el: HTMLElement) => {
      el.style.opacity = '0'
      
      if (!canvas) {
        createCanvas()
      }
      
      // Create fewer particles for gathering effect
      particles.length = 0 // Clear existing particles
      
      const colors = ['#FFFFFF', '#F2F2F2', '#CCCCCC', '#888888']
      const screenSize = window.innerWidth * window.innerHeight
      const particleCount = screenSize < 800000 ? 15 : 30 // Much fewer particles
      
      // Get viewport center for inward movement
      const viewCenterX = window.innerWidth / 2
      const viewCenterY = window.innerHeight / 2
      
      for (let i = 0; i < particleCount; i++) {
        // Position particles around the edges of the screen
        let particleX, particleY
        const edge = Math.floor(Math.random() * 4) // 0=top, 1=right, 2=bottom, 3=left
        
        switch (edge) {
          case 0: // Top edge
            particleX = Math.random() * window.innerWidth
            particleY = -20
            break
          case 1: // Right edge
            particleX = window.innerWidth + 20
            particleY = Math.random() * window.innerHeight
            break
          case 2: // Bottom edge
            particleX = Math.random() * window.innerWidth
            particleY = window.innerHeight + 20
            break
          case 3: // Left edge
            particleX = -20
            particleY = Math.random() * window.innerHeight
            break
          default:
            particleX = Math.random() * window.innerWidth
            particleY = Math.random() * window.innerHeight
        }
        
        const particle: Particle = {
          id: Date.now() + Math.random(),
          x: particleX,
          y: particleY,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.5 + 0.5, // Even smaller particles
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.5
        }
        particles.push(particle)
      }
    }

    const enter = (el: HTMLElement, done: () => void) => {
      // Start gather animation immediately
      setTimeout(() => {
        if (particles.length > 0) {
          isAnimating = true
          animateParticles('gather', el)
        }
        
        // Fade in the actual element quickly but smoothly
        el.style.transition = 'opacity 0.4s ease'
        el.style.opacity = '1'
        
        setTimeout(() => {
          done()
        }, 500) // Reduced from 700ms
      }, 20) // Reduced from 50ms
    }

    const afterEnter = () => {
      // Clean up
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      particles.length = 0
      removeCanvas()
      isAnimating = false
    }

    return {
      beforeLeave,
      leave,
      beforeEnter,
      enter,
      afterEnter
    }
  }
})
</script>

<style scoped>
.particle-enter-active,
.particle-leave-active {
  transition: all 0.5s ease;
}

.particle-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
  filter: blur(3px);
}

.particle-leave-to {
  opacity: 0;
  transform: scale(1.05) translateY(-10px);
  filter: blur(3px);
}

.particle-enter-active {
  transition: opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s, filter 0.4s ease 0.2s;
}

.particle-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease, filter 0.4s ease;
}

/* Add subtle glow effect during transitions */
.particle-enter-active *,
.particle-leave-active * {
  box-shadow: 0 0 15px rgba(242, 242, 242, 0.08), 0 0 30px rgba(0, 255, 255, 0.03);
}
</style> 