<template>
  <button 
    @click="toggleAudio" 
    class="cyber-button audio-control"
    :class="{ 'audio-off': !isPlaying }"
  >
    {{ isPlaying ? 'BGM: ON' : 'BGM: OFF' }}
  </button>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'

export default defineComponent({
  name: 'AudioControl',
  setup() {
    const isPlaying = ref(true)
    let audioContext: AudioContext | null = null
    let audioBuffer: AudioBuffer | null = null
    let currentSource: AudioBufferSourceNode | null = null
    let nextSource: AudioBufferSourceNode | null = null
    let gainNode: GainNode | null = null
    let checkInterval: number | null = null
    let lastStartTime = 0
    const overlapTime = 0.1 // seconds of overlap

    const createAudioSource = () => {
      if (!audioContext || !audioBuffer) return null
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(gainNode!)
      return source
    }

    const scheduleNextLoop = (currentTime: number) => {
      if (!audioContext || !audioBuffer) return

      // Create and schedule the next source
      nextSource = createAudioSource()
      if (!nextSource) return

      // Calculate when to start the next loop
      // Start it slightly before the current one ends
      const nextStartTime = lastStartTime + audioBuffer.duration - overlapTime
      
      if (currentTime >= nextStartTime) {
        // Start the next loop immediately
        nextSource.start(0)
        lastStartTime = audioContext.currentTime
        
        // Clean up the current source
        if (currentSource) {
          currentSource.stop(audioContext.currentTime + overlapTime)
        }
        
        // Update references
        currentSource = nextSource
        nextSource = null
      }
    }

    const startPlaying = async () => {
      try {
        // Initialize Web Audio API
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        gainNode = audioContext.createGain()
        gainNode.gain.value = 0.5
        gainNode.connect(audioContext.destination)

        // Load and decode audio file
        const response = await fetch('/neuron_bgm.mp3')
        const arrayBuffer = await response.arrayBuffer()
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

        // Start initial playback
        currentSource = createAudioSource()
        if (currentSource) {
          currentSource.start(0)
          lastStartTime = audioContext.currentTime
          isPlaying.value = true

          // Set up checking interval
          checkInterval = window.setInterval(() => {
            if (audioContext) {
              scheduleNextLoop(audioContext.currentTime)
            }
          }, 10) // Check every 10ms
        }
      } catch (error) {
        console.log('Audio playback failed:', error)
        isPlaying.value = false
      }
    }

    const stopPlaying = () => {
      if (checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
      }

      // Only stop sources that are actually playing
      try {
        if (currentSource && audioContext) {
          // Check if the source is currently scheduled to play
          const currentTime = audioContext.currentTime
          if (currentTime >= lastStartTime && currentTime < lastStartTime + (audioBuffer?.duration || 0)) {
            currentSource.stop()
          }
        }
        currentSource = null

        if (nextSource && audioContext) {
          // For nextSource, we'll just disconnect it since it might not have started
          nextSource.disconnect()
        }
        nextSource = null

        if (audioContext) {
          audioContext.close()
          audioContext = null
        }
      } catch (error) {
        console.warn('Error while stopping audio:', error)
      }
    }

    const toggleAudio = () => {
      if (isPlaying.value) {
        stopPlaying()
      } else {
        startPlaying()
      }
      isPlaying.value = !isPlaying.value
    }

    // Add user interaction event listeners to enable autoplay
    const enableAudio = () => {
      if (!isPlaying.value) {
        startPlaying()
      }
      // Remove the event listeners after first interaction
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
    }

    onMounted(() => {
      // Start playing and also set up interaction listeners as fallback
      startPlaying()
      document.addEventListener('click', enableAudio)
      document.addEventListener('keydown', enableAudio)
    })

    onBeforeUnmount(() => {
      // Clean up
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
      stopPlaying()
    })

    return {
      isPlaying,
      toggleAudio
    }
  }
})
</script>

<style scoped>
.audio-control {
  position: relative;
  padding-left: 2rem !important;
}

.audio-control::before {
  content: '♪';
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
}

.audio-off::before {
  content: '♪';
  text-decoration: line-through;
}

.audio-control:hover::before {
  animation: musicNote 0.5s ease infinite;
}

@keyframes musicNote {
  0% {
    transform: translateY(-50%) scale(1);
  }
  50% {
    transform: translateY(-50%) scale(1.2);
  }
  100% {
    transform: translateY(-50%) scale(1);
  }
}
</style> 