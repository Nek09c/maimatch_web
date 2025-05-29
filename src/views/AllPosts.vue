<template>
  <div class="all-posts-container">
    <div class="cyber-box">
      <h2 class="glitch">ALL CONNECTIONS</h2>
      
      <div v-if="loading" class="loading">LOADING CONNECTIONS...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="posts.length === 0" class="no-posts">NO CONNECTIONS FOUND</div>
      
      <div v-else class="posts-grid">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <div class="post-header">
            <span class="post-location glitch">{{ post.location }}</span>
            <span class="post-time">{{ formatTime(post.createdAt) }}</span>
          </div>
          <div class="post-author">
            <span class="author-name">{{ post.authorName || post.displayName }}</span>
            <button 
              v-if="isAuthenticated && userId === post.userId"
              @click="togglePostStatus(post)"
              class="match-status clickable" 
              :class="{ matched: post.isMatched }"
              :title="post.isMatched ? 'Click to mark as OPEN' : 'Click to mark as MATCHED'"
            >
              {{ post.isMatched ? '✓ MATCHED' : '○ OPEN' }}
            </button>
            <span 
              v-else
              class="match-status" 
              :class="{ matched: post.isMatched }"
            >
              {{ post.isMatched ? '✓ MATCHED' : '○ OPEN' }}
            </span>
          </div>
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-content">{{ post.content }}</p>
          <div class="post-details">
            <div class="detail-row" v-if="post.genreString">
              <span class="detail-label">GENRES:</span>
              <span class="detail-value">{{ post.genreString }}</span>
            </div>
            <div class="detail-row" v-if="post.levelString">
              <span class="detail-label">LEVELS:</span>
              <span class="detail-value">{{ post.levelString }}</span>
            </div>
            <div class="detail-row" v-if="post.songIdsString">
              <span class="detail-label">SONGS:</span>
              <span class="detail-value">{{ post.songIdsString }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { collection, query, orderBy, Timestamp, onSnapshot, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'

interface Post {
  id: string;
  authorName: string;
  content: string;
  createdAt: any; // Firebase Timestamp
  userId: string; // Google Auth UID
  userEmail: string;
  displayName: string;
  genreString: string;
  isMatched: boolean;
  levelString: string;
  location: string;
  songIdsString: string;
  title: string;
}

export default defineComponent({
  name: 'AllPosts',
  setup() {
    const instance = getCurrentInstance()
    const db = instance?.appContext.config.globalProperties.$db
    const { isAuthenticated, userId } = useAuth()
    const posts = ref<Post[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)

    const formatTime = (createdAt: any) => {
      if (!createdAt) return 'Unknown time'
      
      let postTime: Date
      if (createdAt.toDate) {
        // Firebase Timestamp
        postTime = createdAt.toDate()
      } else if (createdAt instanceof Date) {
        postTime = createdAt
      } else {
        return 'Invalid time'
      }
      
      const now = new Date()
      const diff = now.getTime() - postTime.getTime()
      
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) return `${days}d ago`
      if (hours > 0) return `${hours}h ago`
      if (minutes > 0) return `${minutes}m ago`
      return 'just now'
    }

    const loadPosts = async () => {
      if (!db) {
        error.value = 'Firestore not initialized'
        loading.value = false
        return
      }

      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          posts.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Post[]
          loading.value = false
        }, (err) => {
          error.value = 'Error loading posts: ' + err.message
          loading.value = false
        })

        return unsubscribe
      } catch (err: any) {
        error.value = 'Error setting up posts listener: ' + err.message
        loading.value = false
      }
    }

    const togglePostStatus = async (post: Post) => {
      console.log('Toggling post status...')
      if (!db) {
        console.error('No database connection')
        return
      }

      try {
        const postRef = doc(db, 'posts', post.id)
        const newStatus = !post.isMatched
        await updateDoc(postRef, {
          isMatched: newStatus
        })
        console.log(`Post status updated: ${post.id} is now ${newStatus ? 'MATCHED' : 'OPEN'}`)
      } catch (err) {
        console.error('Error toggling post status:', err)
      }
    }

    onMounted(() => {
      loadPosts()
    })

    return {
      posts,
      loading,
      error,
      formatTime,
      isAuthenticated,
      userId,
      togglePostStatus
    }
  }
})
</script>

<style scoped>
.all-posts-container {
  padding: 1rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.post-card {
  border: 1px solid var(--system-border);
  padding: 1.5rem;
  background: var(--system-bg);
  transition: transform 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.post-author {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--system-border);
}

.author-name {
  color: var(--system-text);
  font-weight: bold;
  font-size: 0.9rem;
}

.match-status {
  color: var(--lain-accent);
  font-size: 0.8rem;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--lain-accent);
  background: transparent;
}

.match-status.matched {
  color: var(--lain-glitch);
  border-color: var(--lain-glitch);
  background: rgba(0, 255, 255, 0.1);
}

.match-status.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--lain-bg);
  font-family: "Courier New", monospace;
  text-transform: uppercase;
}

.match-status.clickable:hover {
  background: var(--lain-accent);
  color: var(--lain-bg);
  box-shadow: 0 0 10px rgba(242, 242, 242, 0.5);
  transform: translateY(-1px);
}

.match-status.clickable.matched:hover {
  background: var(--lain-glitch);
  color: var(--lain-bg);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.post-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--system-border);
}

.detail-row {
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
}

.detail-label {
  color: var(--system-accent);
  font-weight: bold;
  min-width: 80px;
  margin-right: 0.5rem;
}

.detail-value {
  color: var(--system-text);
  opacity: 0.9;
  flex: 1;
}

.post-location {
  color: var(--system-glitch);
  font-weight: bold;
  font-size: 0.9rem;
}

.post-time {
  color: var(--system-accent);
  opacity: 0.8;
  font-size: 0.8rem;
}

.post-title {
  color: var(--system-text);
  margin: 0.5rem 0;
  font-size: 1.2rem;
}

.post-content {
  color: var(--system-text);
  opacity: 0.9;
  line-height: 1.6;
  font-size: 0.9rem;
}

.loading, .error, .no-posts {
  text-align: center;
  padding: 2rem;
  color: var(--system-text);
  font-style: italic;
}

.error {
  color: var(--system-accent);
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style> 