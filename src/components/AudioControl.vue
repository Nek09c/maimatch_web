<template>
  <button 
    @click="toggleTheme" 
    class="cyber-button audio-control"
  >
    {{ isDark ? '日間模式' : '夜間模式' }}
  </button>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'AudioControl',
  setup() {
    const isDark = ref(false)

    const applyTheme = (dark: boolean) => {
      const body = document.body
      // Disable transitions during switch to avoid stagger
      body.classList.add('theme-switching')
      
      if (dark) {
        body.classList.add('dark-mode')
        localStorage.setItem('theme', 'dark')
      } else {
        body.classList.remove('dark-mode')
        localStorage.setItem('theme', 'light')
      }

      // Re-enable transitions on next frame
      requestAnimationFrame(() => {
        // small timeout to ensure styles applied
        setTimeout(() => body.classList.remove('theme-switching'), 0)
      })
    }

    const toggleTheme = () => {
      isDark.value = !isDark.value
      applyTheme(isDark.value)
    }

    onMounted(() => {
      const saved = localStorage.getItem('theme')
      isDark.value = saved === 'dark'
      applyTheme(isDark.value)
    })

    return {
      isDark,
      toggleTheme
    }
  }
})
</script>

<style scoped>
.audio-control {
  position: relative;
  padding-left: 1rem !important;
}

/* no icon for theme button */
</style> 