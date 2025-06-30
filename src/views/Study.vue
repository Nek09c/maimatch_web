<template>
  <div class="study-page">
    <div class="study-container">
      <div class="timer-display">
        <h1>Study Time</h1>
        <div class="timer">{{ formatTime(elapsedTime) }}</div>
      </div>
      
      <div class="prayer-section">
        <button 
          class="prayer-button"
          @click="prayToCirno"
        >
          🧊 Pray to Cirno Fumo for concentration and good luck 🧊
        </button>
        <div class="prayer-count">
          Prayers offered: {{ prayerCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  name: 'Study',
  setup() {
    const elapsedTime = ref(0)
    const prayerCount = ref(0)
    const startTime = ref(Date.now())
    const timerInterval = ref<number | null>(null)

    const getImageUrl = (imageName: string) => {
      const baseUrl = process.env.NODE_ENV === 'production' ? '/maimatch_web' : '';
      return `${baseUrl}/${imageName}`;
    };

    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const updateTimer = () => {
      elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
    }

    const prayToCirno = () => {
      prayerCount.value++
      // Add a little visual feedback
      const button = document.querySelector('.prayer-button') as HTMLElement
      if (button) {
        button.style.transform = 'scale(0.95)'
        setTimeout(() => {
          button.style.transform = 'scale(1)'
        }, 150)
      }
    }

    onMounted(() => {
      // Load saved prayer count from localStorage
      const savedCount = localStorage.getItem('cirno-prayer-count')
      if (savedCount) {
        prayerCount.value = parseInt(savedCount, 10)
      }

      // Set background image after component mounts
      const backgroundElement = document.querySelector('.study-page') as HTMLElement;
      if (backgroundElement) {
        backgroundElement.style.backgroundImage = `url(${getImageUrl('studycirno.png')})`;
      }

      // Start the timer
      timerInterval.value = window.setInterval(updateTimer, 1000)
    })

    onUnmounted(() => {
      // Save prayer count to localStorage
      localStorage.setItem('cirno-prayer-count', prayerCount.value.toString())
      
      // Clear the timer
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
    })

    return {
      elapsedTime,
      prayerCount,
      formatTime,
      prayToCirno
    }
  }
})
</script>

<style>
/* Reset all inherited styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

.study-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-size: 100% auto;
  background-position: center 40%;
  background-repeat: no-repeat;
  background-color: #f0f0f0;
}

.study-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.study-container {
  position: relative;
  z-index: 2;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  padding: 2rem;
}

.timer-display {
  margin-bottom: 4rem;
}

.timer-display h1 {
  font-size: 3rem;
  font-weight: 300;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
}

.timer {
  font-size: 4rem;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-weight: 200;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  padding: 1.5rem 3rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 3px;
}

.prayer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.prayer-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 1.2rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 400;
  color: white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7);
  font-family: inherit;
}

.prayer-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.prayer-button:active {
  transform: translateY(0);
}

.prayer-count {
  font-size: 1rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .timer-display h1 {
    font-size: 2.5rem;
  }
  
  .timer {
    font-size: 2.5rem;
    padding: 1rem 2rem;
  }
  
  .prayer-button {
    font-size: 1rem;
    padding: 1rem 2rem;
  }
  
  .study-container {
    padding: 1rem;
  }
}
</style> 