<template>
  <div class="loading-screen" :class="{ 'fade-out': isLoaded }">
    <div class="loading-container">
      <div class="loading-bar-container">
        <div class="loading-bar" :style="{ width: loadingProgress + '%' }"></div>
      </div>
      <div class="loading-text">
        Connections = Wiring<span class="cursor" :class="{ 'show-alt': showAlt }"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'LoadingScreen',
  setup(props, { emit }) {
    const loadingProgress = ref(0)
    const isLoaded = ref(false)
    const showAlt = ref(false)

    onMounted(() => {
      // Load the font
      const link = document.createElement('link')
      link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      // Cursor animation
      setInterval(() => {
        showAlt.value = !showAlt.value
      }, 500)

      // Simulate loading progress over 1.5 seconds
      const duration = 1500 // 1.5 seconds
      const interval = 50 // Update every 50ms
      const steps = duration / interval
      const increment = 100 / steps
      let currentStep = 0

      const progressInterval = setInterval(() => {
        currentStep++
        loadingProgress.value = Math.min(currentStep * increment, 100)

        if (loadingProgress.value >= 100) {
          clearInterval(progressInterval)
          // Add a small delay before fade out
          setTimeout(() => {
            isLoaded.value = true
            // Emit loaded event after fade animation
            setTimeout(() => {
              emit('loading-complete')
            }, 500) // Match the fade-out animation duration
          }, 200)
        }
      }, interval)
    })

    return {
      loadingProgress,
      isLoaded,
      showAlt
    }
  }
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.5s ease;
}

.loading-screen.fade-out {
  opacity: 0;
  pointer-events: none;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-bar-container {
  width: 60%;
  height: 30px;
  border: 2px solid #00ff00;
  position: relative;
  overflow: hidden;
}

.loading-bar-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(90deg, 
      transparent 0%, 
      rgba(0, 255, 0, 0.1) 50%, 
      transparent 100%);
  animation: scan 1s linear infinite;
}

.loading-bar {
  height: 100%;
  width: 0;
  background-color: #00ff00;
  transition: width 0.05s linear;
  position: relative;
  image-rendering: pixelated;
  box-shadow: 0 0 10px #00ff00;
}

.loading-bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 2px;
  height: 100%;
  background: white;
  filter: blur(1px);
}

.loading-text {
  font-family: 'Press Start 2P', monospace;
  color: #00ff00;
  font-size: 16px;
  letter-spacing: 2px;
  text-shadow: 0 0 5px #00ff00;
  image-rendering: pixelated;
  position: relative;
}

.cursor {
  display: inline-block;
  color: #00ff00;
  margin-left: 4px;
  text-shadow: 0 0 5px #00ff00;
  position: relative;
  font-family: monospace;
}

.cursor::after {
  content: '...';
  letter-spacing: 2px;
}

.cursor.show-alt::after {
  content: '..|';
  letter-spacing: 2px;
}

@keyframes scan {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

/* Flash effect when loading completes */
.loading-screen.fade-out::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  animation: flash 0.5s ease-out forwards;
}

@keyframes flash {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style> 