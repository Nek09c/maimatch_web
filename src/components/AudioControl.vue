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
        // If context already exists, resume it instead of creating new one
        if (audioContext) {
          await audioContext.resume()
        } else {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        // Create gain node if it doesn't exist
        if (!gainNode) {
          gainNode = audioContext.createGain()
          gainNode.gain.value = 0.5
          gainNode.connect(audioContext.destination)
        }

        // Only load audio buffer if we haven't already
        if (!audioBuffer) {
          console.log('Loading audio file...')
          // Get the base URL for the deployment
          const baseUrl = import.meta.env.BASE_URL || '/'
          // Construct the full audio path
          const audioPath = `${baseUrl}assets/neuron_bgm.mp3`.replace('//', '/')
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
        // Try to clean up on error
        stopPlaying()
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

    const toggleAudio = async () => {
      try {
        if (isPlaying.value) {
          console.log('Stopping audio...')
          stopPlaying()
          isPlaying.value = false
        } else {
          console.log('Starting audio...')
          await startPlaying()
          // Only update isPlaying if startPlaying succeeds
          if (audioContext && audioContext.state === 'running') {
            isPlaying.value = true
          }
        }
      } catch (error) {
        console.error('Error toggling audio:', error)
        isPlaying.value = false
      }
    }

    // Enhance the enableAudio function to handle autoplay better
    const enableAudio = async () => {
      try {
        if (!isPlaying.value || (audioContext && audioContext.state !== 'running')) {
          console.log('Enabling audio via user interaction...')
          await startPlaying()
        }
      } catch (error) {
        console.error('Error enabling audio:', error)
      }
    }

    onMounted(async () => {
      // Try to start playing but don't force it
      try {
        await startPlaying()
      } catch (error) {
        console.log('Initial autoplay failed, waiting for user interaction:', error)
        isPlaying.value = false
      }
      
      // Set up interaction listeners
      document.addEventListener('click', enableAudio)
      document.addEventListener('keydown', enableAudio)

      // Add visibility change handler
      document.addEventListener('visibilitychange', async () => {
        if (document.hidden) {
          console.log('Page hidden, suspending audio')
          if (audioContext) {
            await audioContext.suspend()
          }
        } else if (isPlaying.value) {
          console.log('Page visible, resuming audio')
          if (audioContext) {
            await audioContext.resume()
          }
        }
      })
    })

    onBeforeUnmount(() => {
      // Enhanced cleanup
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
      document.removeEventListener('visibilitychange', () => {})
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