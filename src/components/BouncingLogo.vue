<template>
  <div class="bouncing-logo-container">
    <img 
      ref="logoRef"
      src="/maimatch_logo.jpg" 
      alt="MaiMatch Logo" 
      class="bouncing-logo"
      :style="{ 
        left: position.x + 'px', 
        top: position.y + 'px',
        transform: `scale(${scale})`
      }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  name: 'BouncingLogo',
  setup() {
    const logoRef = ref<HTMLImageElement>()
    const position = ref({ x: 100, y: 100 })
    const velocity = ref({ x: 2, y: 1.5 })
    const scale = ref(0.3)
    
    let animationId: number
    let containerWidth = 0
    let containerHeight = 0
    let logoWidth = 0
    let logoHeight = 0

    const updateDimensions = () => {
      // Use full viewport dimensions
      containerWidth = window.innerWidth
      containerHeight = window.innerHeight
      
      if (logoRef.value) {
        // Calculate actual rendered logo dimensions
        logoWidth = logoRef.value.naturalWidth * scale.value
        logoHeight = logoRef.value.naturalHeight * scale.value
      }
    }

    const updatePosition = () => {
      // Update position
      position.value.x += velocity.value.x
      position.value.y += velocity.value.y

      // Check horizontal boundaries and bounce
      if (position.value.x <= 0) {
        position.value.x = 0
        velocity.value.x = Math.abs(velocity.value.x) // Ensure positive velocity
        // Add slight randomness to prevent perfect loops
        velocity.value.y += (Math.random() - 0.5) * 0.1
      } else if (position.value.x >= containerWidth - logoWidth) {
        position.value.x = containerWidth - logoWidth
        velocity.value.x = -Math.abs(velocity.value.x) // Ensure negative velocity
        // Add slight randomness to prevent perfect loops
        velocity.value.y += (Math.random() - 0.5) * 0.1
      }

      // Check vertical boundaries and bounce
      if (position.value.y <= 0) {
        position.value.y = 0
        velocity.value.y = Math.abs(velocity.value.y) // Ensure positive velocity
        // Add slight randomness to prevent perfect loops
        velocity.value.x += (Math.random() - 0.5) * 0.1
      } else if (position.value.y >= containerHeight - logoHeight) {
        position.value.y = containerHeight - logoHeight
        velocity.value.y = -Math.abs(velocity.value.y) // Ensure negative velocity
        // Add slight randomness to prevent perfect loops
        velocity.value.x += (Math.random() - 0.5) * 0.1
      }

      // Keep velocity within reasonable bounds
      velocity.value.x = Math.max(-4, Math.min(4, velocity.value.x))
      velocity.value.y = Math.max(-4, Math.min(4, velocity.value.y))

      // Ensure minimum velocity to prevent getting stuck
      if (Math.abs(velocity.value.x) < 0.5) {
        velocity.value.x = velocity.value.x > 0 ? 0.5 : -0.5
      }
      if (Math.abs(velocity.value.y) < 0.5) {
        velocity.value.y = velocity.value.y > 0 ? 0.5 : -0.5
      }

      animationId = requestAnimationFrame(updatePosition)
    }

    const initializeAnimation = () => {
      if (!logoRef.value) return

      updateDimensions()
      
      // Ensure starting position is within bounds
      position.value.x = Math.max(0, Math.min(containerWidth - logoWidth, position.value.x))
      position.value.y = Math.max(0, Math.min(containerHeight - logoHeight, position.value.y))

      // Start animation
      updatePosition()
    }

    const handleResize = () => {
      updateDimensions()
      
      // Adjust position if window got smaller
      position.value.x = Math.max(0, Math.min(containerWidth - logoWidth, position.value.x))
      position.value.y = Math.max(0, Math.min(containerHeight - logoHeight, position.value.y))
    }

    onMounted(() => {
      // Wait for image to load
      if (logoRef.value) {
        if (logoRef.value.complete) {
          initializeAnimation()
        } else {
          logoRef.value.onload = initializeAnimation
        }
      }

      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      window.removeEventListener('resize', handleResize)
    })

    return {
      logoRef,
      position,
      scale
    }
  }
})
</script>

<style scoped>
.bouncing-logo-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.bouncing-logo {
  position: absolute;
  opacity: 0.3;
  user-select: none;
  pointer-events: none;
  transition: none;
  border-radius: 50%;
  filter: drop-shadow(0 0 15px rgba(242, 242, 242, 0.4)) drop-shadow(0 0 25px rgba(242, 242, 242, 0.2));
}
</style> 