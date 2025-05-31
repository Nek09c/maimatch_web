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
      if (!audioContext || !audioBuffer || !gainNode) return null
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(gainNode)
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
        // Always create a new audio context and nodes when starting
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        gainNode = audioContext.createGain()
        gainNode.gain.value = 0.5
        gainNode.connect(audioContext.destination)

        // Only load audio buffer if we haven't already
        if (!audioBuffer) {
          console.log('Loading audio file...')
          
          // Get the deployment base URL
          const getBaseUrl = () => {
            // Check if we're on GitHub Pages
            const currentUrl = window.location.href
            if (currentUrl.includes('github.io')) {
              // Extract the repository name from the URL
              const pathParts = window.location.pathname.split('/')
              return pathParts[1] ? `/${pathParts[1]}/` : '/'
            }
            return '/'
          }

          const baseUrl = getBaseUrl()
          const audioPath = `${baseUrl}assets/neuron_bgm.mp3`.replace(/\/+/g, '/')
          console.log('Attempting to load audio from:', audioPath)
          
          const response = await fetch(audioPath)
          if (!response.ok) {
            throw new Error(`Failed to load audio file from ${audioPath}: ${response.status} ${response.statusText}`)
          }
          const arrayBuffer = await response.arrayBuffer()
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          console.log('Audio file loaded successfully')
        }

        // Start initial playback
        currentSource = createAudioSource()
        if (currentSource) {
          currentSource.start(0)
          lastStartTime = audioContext.currentTime
          isPlaying.value = true

          // Set up checking interval
          if (checkInterval) {
            clearInterval(checkInterval)
          }
          checkInterval = window.setInterval(() => {
            if (audioContext && isPlaying.value) {
              scheduleNextLoop(audioContext.currentTime)
            }
          }, 10) // Check every 10ms

          console.log('Audio playback started successfully')
        }
      } catch (error) {
        console.error('Audio playback failed:', error)
        isPlaying.value = false
        // Clean up on error
        await stopPlaying()
      }
    }

    const stopPlaying = async () => {
      try {
        if (checkInterval) {
          clearInterval(checkInterval)
          checkInterval = null
        }

        // Stop and disconnect current source
        if (currentSource) {
          try {
            currentSource.stop()
          } catch (e) {
            // Ignore errors if source was already stopped
          }
          currentSource.disconnect()
          currentSource = null
        }

        // Stop and disconnect next source
        if (nextSource) {
          try {
            nextSource.stop()
          } catch (e) {
            // Ignore errors if source was already stopped
          }
          nextSource.disconnect()
          nextSource = null
        }

        // Disconnect and null the gain node
        if (gainNode) {
          gainNode.disconnect()
          gainNode = null
        }

        // Close and null the audio context
        if (audioContext) {
          await audioContext.close()
          audioContext = null
        }

        // Keep the decoded audio buffer for reuse
        console.log('Audio stopped successfully')
      } catch (error) {
        console.error('Error stopping audio:', error)
      }
    }

    const toggleAudio = async () => {
      try {
        if (isPlaying.value) {
          console.log('Stopping audio...')
          isPlaying.value = false  // Set state before stopping
          await stopPlaying()
        } else {
          console.log('Starting audio...')
          await startPlaying()
          // Only set to true if startPlaying succeeded
          isPlaying.value = true
        }
      } catch (error) {
        console.error('Error toggling audio:', error)
        isPlaying.value = false  // Ensure it's off if there's an error
        await stopPlaying()  // Clean up on error
      }
    }

    // Enhance the enableAudio function to respect the isPlaying state
    const enableAudio = async () => {
      try {
        if (!isPlaying.value) {
          // Don't auto-enable if user has explicitly turned it off
          return
        }
        console.log('Enabling audio via user interaction...')
        await startPlaying()
      } catch (error) {
        console.error('Error enabling audio:', error)
        isPlaying.value = false
      }
    }

    onMounted(async () => {
      // Start with audio off by default
      isPlaying.value = false
      
      // Set up interaction listeners
      document.addEventListener('click', enableAudio)
      document.addEventListener('keydown', enableAudio)

      // Add visibility change handler
      document.addEventListener('visibilitychange', async () => {
        if (document.hidden) {
          console.log('Page hidden, stopping audio')
          await stopPlaying()
        } else if (isPlaying.value) {
          console.log('Page visible, resuming audio')
          await startPlaying()
        }
      })
    })

    onBeforeUnmount(async () => {
      // Enhanced cleanup
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
      document.removeEventListener('visibilitychange', () => {})
      await stopPlaying()
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