<template>
  <div>
    <LoadingScreen v-if="!isLoadingComplete && isFirstVisit" @loading-complete="onLoadingComplete" />
    
    <!-- CC Character Image -->
    <div class="cc-character">
      <img 
        :src="getImageUrl('maimatch_CC.PNG')" 
        alt="CC Character" 
        class="cc-image"
      />
    </div>

    <!-- Lain Character Image -->
    <div class="lain-character">
      <img 
        :src="getImageUrl('maimatch_lain.PNG')" 
        alt="Lain Character" 
        class="lain-image"
      />
    </div>

    <div class="home-container" :class="{ 'content-loaded': isLoadingComplete || !isFirstVisit }">
      <div class="terminal-text">
        <h2>歡迎來到 MAIMATCH</h2>
        <p>連接香港各地嘅 MAIMAI 玩家</p>
      </div>

      <div class="cyber-box stats-container">
        <h3>系統狀態</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">總共玩過嘅歌</span>
            <span class="stat-value glitch">{{ totalSongsPlayed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">總共嘅貼文</span>
            <span class="stat-value glitch">{{ totalPosts }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">機舖位置</span>
            <span class="stat-value glitch">{{ arcadeLocations }}</span>
          </div>
        </div>
      </div>

      <div class="cyber-box recent-posts">
        <h3>最近嘅マッチ</h3>
        <div v-if="recentPosts.length === 0" class="no-recent-posts">
          <p>過去一個鐘冇新嘅マッチ</p>
          <p style="font-size: 0.8rem; opacity: 0.7;">遲啲再睇或者開新貼文啦！</p>
        </div>
        <div v-else v-for="post in recentPosts" :key="post.id" class="post-item">
          <span class="post-location">{{ post.location }}</span>
          <span class="post-title">{{ post.title }}</span>
          <span class="post-author">{{ post.authorName }}</span>
          <span class="post-time">{{ post.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, getCurrentInstance } from "vue";
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import LoadingScreen from './LoadingScreen.vue'

interface RecentPost {
  id: string;
  location: string;
  title: string;
  time: string;
  authorName: string;
}

export default defineComponent({
  name: "Home",
  components: {
    LoadingScreen
  },
  setup() {
    const isLoadingComplete = ref(false)
    const isFirstVisit = ref(true)
    const totalSongsPlayed = ref(0);
    const totalPosts = ref(0);
    const arcadeLocations = ref(20);
    const recentPosts = ref<RecentPost[]>([]);

    const onLoadingComplete = () => {
      isLoadingComplete.value = true
      // Mark that the user has visited
      localStorage.setItem('hasVisitedBefore', 'true')
      isFirstVisit.value = false
    }

    const checkFirstVisit = () => {
      const hasVisitedBefore = localStorage.getItem('hasVisitedBefore')
      if (hasVisitedBefore === 'true') {
        isFirstVisit.value = false
        isLoadingComplete.value = true
      }
    }

    const getImageUrl = (imageName: string) => {
      const baseUrl = process.env.NODE_ENV === 'production' ? '/maimatch_web' : '';
      return `${baseUrl}/${imageName}`;
    };

    const formatTime = (createdAt: any) => {
      if (!createdAt) return '未知時間'
      
      let postTime: Date
      if (createdAt.toDate) {
        // Firebase Timestamp
        postTime = createdAt.toDate()
      } else if (createdAt instanceof Date) {
        postTime = createdAt
      } else {
        return '無效時間'
      }
      
      const now = new Date()
      const diff = now.getTime() - postTime.getTime()
      
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) return `${days}日前`
      if (hours > 0) return `${hours}小時前`
      if (minutes > 0) return `${minutes}分鐘前`
      return '啱啱'
    }

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
        totalPosts.value = postsSnapshot.size

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
        
        console.log(`Home Stats - Total posts: ${totalPosts.value}, Matched posts: ${matchedPostsCount}, Total songs played: ${totalSongsPlayed.value}`)
      } catch (error) {
        console.error('Error loading home stats:', error)
      }
    }

    const loadRecentPosts = async () => {
      try {
        const instance = getCurrentInstance()
        const db = instance?.appContext.config.globalProperties.$db
        
        if (!db) {
          console.error('Firestore not initialized')
          return
        }

        // Calculate timestamp for 1 hour ago
        const oneHourAgo = new Date()
        oneHourAgo.setHours(oneHourAgo.getHours() - 1)
        const oneHourAgoTimestamp = Timestamp.fromDate(oneHourAgo)

        // Query posts created in the last hour, ordered by creation time (newest first)
        const q = query(
          collection(db, 'posts'),
          where('createdAt', '>=', oneHourAgoTimestamp),
          orderBy('createdAt', 'desc')
        )

        const querySnapshot = await getDocs(q)
        const posts: RecentPost[] = []
        
        querySnapshot.forEach((doc) => {
          const postData = doc.data()
          posts.push({
            id: doc.id,
            location: postData.location,
            title: postData.title,
            time: formatTime(postData.createdAt),
            authorName: postData.authorName || postData.displayName
          })
        })

        recentPosts.value = posts.slice(0, 5) // Limit to 5 most recent posts
        console.log(`Loaded ${posts.length} recent posts from the last hour`)
      } catch (error) {
        console.error('Error loading recent posts:', error)
        // If there's an error (like missing index), fall back to getting latest posts without time filter
        try {
          const instance = getCurrentInstance()
          const db = instance?.appContext.config.globalProperties.$db
          
          if (!db) {
            console.error('Firestore not initialized in fallback')
            return
          }

          const fallbackQuery = query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc')
          )
          const fallbackSnapshot = await getDocs(fallbackQuery)
          const fallbackPosts: RecentPost[] = []
          
          fallbackSnapshot.forEach((doc) => {
            const postData = doc.data()
            fallbackPosts.push({
              id: doc.id,
              location: postData.location,
              title: postData.title,
              time: formatTime(postData.createdAt),
              authorName: postData.authorName || postData.displayName
            })
          })
          
          recentPosts.value = fallbackPosts.slice(0, 5)
          console.log('Fallback: Loaded 5 most recent posts')
        } catch (fallbackError) {
          console.error('Error in fallback query:', fallbackError)
        }
      }
    }

    onMounted(() => {
      checkFirstVisit()
      loadStats()
      loadRecentPosts()
    })

    return {
      isLoadingComplete,
      isFirstVisit,
      onLoadingComplete,
      totalSongsPlayed,
      totalPosts,
      arcadeLocations,
      recentPosts,
      formatTime,
      getImageUrl
    };
  },
});
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  min-height: 70vh;
  background: transparent;
  opacity: 0;
  transform: scale(0.98);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.content-loaded {
  opacity: 1;
  transform: scale(1);
}

.stats-container {
  margin-top: 2rem;
  background: transparent !important;
}

.stats-container .cyber-box {
  background: transparent !important;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--lain-accent);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--lain-text);
  opacity: 0.8;
}

.stat-value {
  font-size: 2rem;
  color: var(--lain-accent);
  margin-top: 0.5rem;
}

.recent-posts {
  margin-top: 2rem;
  background: transparent !important;
}

.recent-posts .cyber-box {
  background: transparent !important;
}

.post-item {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--lain-accent);
}

.post-item:last-child {
  border-bottom: none;
}

.post-location {
  color: var(--lain-glitch);
}

.post-title {
  color: var(--lain-text);
}

.post-author {
  color: var(--lain-glitch);
}

.post-time {
  color: var(--lain-accent);
  opacity: 0.8;
  font-size: 0.8rem;
}

.terminal-text {
  text-align: center;
  margin-bottom: 2rem;
  background: transparent;
  position: relative;
  z-index: 1;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
}

.terminal-text h2 {
  font-size: clamp(1.2rem, 4vw, 2.5rem);
  margin-bottom: 1rem;
  background: transparent;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  width: 100%;
  display: block;
}

.terminal-text p {
  font-size: clamp(0.8rem, 2.5vw, 1.2rem);
  opacity: 0.8;
  background: transparent;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  margin: 0 auto;
  white-space: normal;
}

.no-recent-posts {
  text-align: center;
  padding: 2rem;
  color: var(--lain-text);
  opacity: 0.8;
}

.cc-character {
  display: none !important;
}

/* Mobile responsive styles for CC character */
@media screen and (max-width: 768px) {
  .cc-character {
    width: 200px;  /* Half the original width */
    height: 250px; /* Half the original height */
    bottom: 10px;
    left: 10px;
  }
}

/* Even smaller screens */
@media screen and (max-width: 480px) {
  .cc-character {
    width: 150px;  /* Further reduced for very small screens */
    height: 187.5px;
    bottom: 5px;
    left: 5px;
  }
}

/* Force all Home page text to black, remove glow */
.home-container, .home-container * {
  color: #000000 !important;
  text-shadow: none !important;
}

/* Specific elements that previously used accent/glitch colors */
.glitch, .stat-value, .post-location, .post-title, .post-author, .post-time,
.stats-container h3, .recent-posts h3, .terminal-text h2, .terminal-text p {
  color: #000000 !important;
}

.cc-character:hover {
  animation: ccGlow 0.6s ease-in-out infinite;
}

@keyframes ccGlow {
  0% {
    filter: drop-shadow(0 0 10px rgba(242, 242, 242, 0.4)) drop-shadow(0 0 20px rgba(0, 255, 0, 0.3));
    opacity: 0.3;
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(242, 242, 242, 0.8)) drop-shadow(0 0 30px rgba(0, 255, 0, 0.6));
    opacity: 0.4;
  }
  100% {
    filter: drop-shadow(0 0 10px rgba(242, 242, 242, 0.4)) drop-shadow(0 0 20px rgba(0, 255, 0, 0.3));
    opacity: 0.3;
  }
}

.cc-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(242, 242, 242, 0.3)) drop-shadow(0 0 15px rgba(0, 255, 0, 0.2));
  transition: all 0.3s ease;
}

.cc-image:hover {
  transform: scale(1.02);
}

.lain-character {
  display: none !important;
}

/* Mobile responsive styles for Lain character */
@media screen and (max-width: 768px) {
  .lain-character {
    width: 200px;  /* Half the original width */
    height: 250px; /* Half the original height */
    bottom: 10px;
    right: 10px;
  }
}

/* Even smaller screens */
@media screen and (max-width: 480px) {
  .lain-character {
    width: 150px;  /* Further reduced for very small screens */
    height: 187.5px;
    bottom: 5px;
    right: 5px;
  }
}

.lain-character:hover {
  animation: lainGlow 0.6s ease-in-out infinite;
}

@keyframes lainGlow {
  0% {
    filter: drop-shadow(0 0 10px rgba(242, 242, 242, 0.4)) drop-shadow(0 0 20px rgba(255, 0, 255, 0.3));
    opacity: 0.3;
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(242, 242, 242, 0.8)) drop-shadow(0 0 30px rgba(255, 0, 255, 0.6));
    opacity: 0.4;
  }
  100% {
    filter: drop-shadow(0 0 10px rgba(242, 242, 242, 0.4)) drop-shadow(0 0 20px rgba(255, 0, 255, 0.3));
    opacity: 0.3;
  }
}

.lain-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(242, 242, 242, 0.3)) drop-shadow(0 0 15px rgba(255, 0, 255, 0.2));
  transition: all 0.3s ease;
}

.lain-image:hover {
  transform: scale(1.02);
}

/* Override cyber-box backgrounds specifically for home page */
.home-container .cyber-box {
  background: transparent !important;
  backdrop-filter: none !important;
}

.home-container .stats-container,
.home-container .recent-posts {
  background: transparent !important;
}

.home-container .stat-item {
  background: transparent !important;
  border: 1px solid var(--lain-accent);
}

.home-container .post-item {
  background: transparent !important;
}

@media screen and (max-width: 768px) {
  .terminal-text {
    margin-bottom: 1rem;
    padding: 0 0.5rem;
  }
  
  .terminal-text h2 {
    margin-bottom: 0.5rem;
    font-size: clamp(1.2rem, 3.5vw, 2rem);
  }

  .terminal-text p {
    font-size: clamp(0.8rem, 2.2vw, 1rem);
  }
}

@media screen and (max-width: 480px) {
  .terminal-text h2 {
    font-size: clamp(1rem, 3vw, 1.5rem);
  }

  .terminal-text p {
    font-size: clamp(0.7rem, 2vw, 0.9rem);
  }
}
</style>
