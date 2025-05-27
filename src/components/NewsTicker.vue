<template>
  <div class="news-ticker">
    <div class="ticker-content" :style="{ animationDuration: `${duration}s` }">
      <span class="ticker-item">Welcome to maimatch homepage</span>
      <span class="ticker-separator">/</span>
      <span class="ticker-item">Posts created: {{ postCount }}</span>
      <span class="ticker-separator">/</span>
      <span class="ticker-item">Total songs played: {{ totalSongsPlayed }}</span>
      <span class="ticker-separator">/</span>
      <span class="ticker-item">Latest news: Polish cow has been found dead</span>
      <span class="ticker-separator">/</span>
      <span class="ticker-item">Drink Maimai play monster</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, getCurrentInstance } from 'vue'
import { collection, getDocs } from 'firebase/firestore'

export default defineComponent({
  name: 'NewsTicker',
  setup() {
    const postCount = ref(0)
    const totalSongsPlayed = ref(0)
    const duration = 30 // seconds for one complete cycle

    const loadStats = async () => {
      try {
        const instance = getCurrentInstance()
        const db = instance?.appContext.config.globalProperties.$db
        
        if (!db) {
          console.error('Firestore not initialized')
          return
        }

        // Get all posts
        const postsSnapshot = await getDocs(collection(db, 'posts'))
        postCount.value = postsSnapshot.size

        // Calculate total songs played based on matched posts
        let matchedPostsCount = 0
        postsSnapshot.forEach((doc) => {
          const postData = doc.data()
          if (postData.isMatched === true) {
            matchedPostsCount++
          }
        })
        
        // Each matched post represents 4 songs played
        totalSongsPlayed.value = matchedPostsCount * 4
        
        console.log(`Total posts: ${postCount.value}, Matched posts: ${matchedPostsCount}, Total songs played: ${totalSongsPlayed.value}`)
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    onMounted(() => {
      loadStats()
    })

    return {
      postCount,
      totalSongsPlayed,
      duration
    }
  }
})
</script>

<style scoped>
.news-ticker {
  background: transparent;
  padding: 0.5rem 0;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  height: 2.5rem;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.news-ticker:hover {
  /* No container animation on hover - only text effects */
}

.news-ticker::before,
.news-ticker::after {
  content: '';
  position: absolute;
  top: 0;
  width: 100px;
  height: 100%;
  z-index: 2;
}

.news-ticker::before {
  left: 0;
  background: linear-gradient(to right, transparent, transparent);
}

.news-ticker::after {
  right: 0;
  background: linear-gradient(to left, transparent, transparent);
}

.ticker-content {
  display: inline-block;
  animation: ticker linear infinite;
  font-family: "Press Start 2P", "Courier New", monospace;
  font-style: italic;
  color: var(--system-text);
  text-shadow: 2px 2px var(--system-accent), 0 0 10px rgba(242, 242, 242, 0.6), 0 0 20px rgba(242, 242, 242, 0.4);
  line-height: 2.5rem;
  transition: all 0.3s ease;
}

.ticker-content:hover {
  animation: ticker linear infinite, tickerTextBlink 0.6s ease-in-out infinite;
}

@keyframes tickerTextBlink {
  0% {
    text-shadow: 2px 2px var(--system-accent), 0 0 10px rgba(242, 242, 242, 0.6), 0 0 20px rgba(242, 242, 242, 0.4);
  }
  50% {
    text-shadow: 2px 2px var(--system-accent), 0 0 20px rgba(242, 242, 242, 1), 0 0 30px rgba(242, 242, 242, 0.8);
  }
  100% {
    text-shadow: 2px 2px var(--system-accent), 0 0 10px rgba(242, 242, 242, 0.6), 0 0 20px rgba(242, 242, 242, 0.4);
  }
}

.ticker-item {
  display: inline-block;
  margin: 0 1rem;
  font-size: 0.9rem;
  image-rendering: pixelated;
  text-rendering: optimizeSpeed;
  vertical-align: middle;
  text-shadow: 0 0 8px rgba(242, 242, 242, 0.5), 0 0 15px rgba(242, 242, 242, 0.3);
}

.ticker-separator {
  display: inline-block;
  color: var(--system-accent);
  font-size: 2rem;
  margin: 0 0.5rem;
  text-shadow: 2px 2px var(--system-glitch), 0 0 15px rgba(242, 242, 242, 0.8), 0 0 25px rgba(242, 242, 242, 0.5);
  line-height: 2.5rem;
  vertical-align: middle;
  transition: all 0.3s ease;
}

.ticker-separator:hover {
  animation: separatorBlink 0.4s ease-in-out infinite;
}

@keyframes separatorBlink {
  0% {
    text-shadow: 2px 2px var(--system-glitch), 0 0 15px rgba(242, 242, 242, 0.8), 0 0 25px rgba(242, 242, 242, 0.5);
  }
  50% {
    text-shadow: 2px 2px var(--system-glitch), 0 0 25px rgba(242, 242, 242, 1), 0 0 35px rgba(242, 242, 242, 0.8);
  }
  100% {
    text-shadow: 2px 2px var(--system-glitch), 0 0 15px rgba(242, 242, 242, 0.8), 0 0 25px rgba(242, 242, 242, 0.5);
  }
}

@keyframes ticker {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style> 