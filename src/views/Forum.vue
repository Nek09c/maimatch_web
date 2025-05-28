<template>
  <div class="forum-container">
    <div class="cyber-box create-post">
      <h3>CREATE CONNECTION</h3>
      
      <!-- Authentication check -->
      <div v-if="!isAuthenticated" class="auth-required">
        <p class="glitch">⚠️ AUTHENTICATION REQUIRED</p>
        <p>Please sign in with Google to create a post</p>
      </div>
      
      <div v-else class="user-status">
        <p class="posting-as">POSTING AS: <span class="glitch">{{ userDisplayName }}</span></p>
      </div>
      
      <form @submit.prevent="createPost" class="post-form" :class="{ disabled: !isAuthenticated }">
        <div class="form-group">
          <label for="authorName">DISPLAY NAME (Optional)</label>
          <input 
            type="text" 
            id="authorName"
            v-model="newPost.authorName" 
            :placeholder="userDisplayName"
            :disabled="!isAuthenticated"
            class="cyber-input"
          />
        </div>
        
        <div class="form-group">
          <label for="location">LOCATION</label>
          <select 
            id="location"
            v-model="newPost.location" 
            required 
            :disabled="!isAuthenticated"
            class="cyber-input"
          >
            <option value="">SELECT ARCADE</option>
            <option v-for="location in locations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="title">TITLE</label>
          <input 
            type="text" 
            id="title"
            v-model="newPost.title" 
            required 
            :disabled="!isAuthenticated"
            placeholder="Looking for partner..."
            class="cyber-input"
          />
        </div>
        
        <div class="form-group">
          <label for="content">MESSAGE</label>
          <textarea 
            id="content"
            v-model="newPost.content" 
            required 
            :disabled="!isAuthenticated"
            placeholder="Describe what you're looking for..."
            class="cyber-input"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="genreString">PREFERRED GENRES (Optional)</label>
          <input 
            type="text" 
            id="genreString"
            v-model="newPost.genreString" 
            :disabled="!isAuthenticated"
            placeholder="e.g., Pop, Anime, Game Music"
            class="cyber-input"
          />
        </div>
        
        <div class="form-group">
          <label for="levelString">SKILL LEVELS (Optional)</label>
          <input 
            type="text" 
            id="levelString"
            v-model="newPost.levelString" 
            :disabled="!isAuthenticated"
            placeholder="e.g., Master 10-12, Expert 8+"
            class="cyber-input"
          />
        </div>
        
        <div class="form-group">
          <label for="songIdsString">SPECIFIC SONGS (Optional)</label>
          <input 
            type="text" 
            id="songIdsString"
            v-model="newPost.songIdsString" 
            :disabled="!isAuthenticated"
            placeholder="e.g., Ghost Rule, Senbonzakura"
            class="cyber-input"
          />
        </div>
        
        <button 
          type="submit" 
          class="cyber-button submit-btn" 
          :disabled="!isAuthenticated"
        >
          {{ isAuthenticated ? 'CREATE POST' : 'SIGN IN TO POST' }}
        </button>
      </form>
    </div>

    <div class="cyber-box posts-list">
      <h3>ACTIVE CONNECTIONS</h3>
      <div v-if="loading" class="loading">LOADING CONNECTIONS...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="posts.length === 0" class="no-posts">NO CONNECTIONS FOUND</div>
      <div v-else v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <span class="post-location glitch">{{ post.location }}</span>
          <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>
        <div class="post-author">
          <span class="author-name">{{ post.authorName || post.displayName }}</span>
          <span class="match-status" :class="{ matched: post.isMatched }">
            {{ post.isMatched ? '✓ MATCHED' : '○ OPEN' }}
          </span>
        </div>
        <h4 class="post-title">{{ post.title }}</h4>
        <p class="post-content">{{ post.content }}</p>
        <div class="post-details" v-if="post.genreString || post.levelString || post.songIdsString">
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
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { collection, addDoc, getDocs, query, orderBy, Timestamp, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'
import { useUserProfile } from '../composables/useUserProfile'

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
  name: 'Forum',
  setup() {
    const instance = getCurrentInstance()
    const db = instance?.appContext.config.globalProperties.$db
    const { isAuthenticated, userId, userDisplayName, userEmail } = useAuth()
    const { incrementPostsCount } = useUserProfile()
    
    const posts = ref<Post[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)
    const locations = [
      '鑽石山',
      '旺角新之城',
      '旺角 Smart Games',
      '荃金',
      '大埔李福林',
      '油麻地金星',
      '旺角金雞',
      '灣仔金星'
    ]

    const newPost = ref({
      authorName: '',
      location: '',
      title: '',
      content: '',
      displayName: '',
      genreString: '',
      levelString: '',
      songIdsString: '',
      isMatched: false,
      createdAt: Timestamp.now()
    })

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
          console.error('Error loading posts:', err)
          error.value = 'Failed to load posts'
          loading.value = false
        })

        // Clean up listener when component is unmounted
        onUnmounted(() => {
          unsubscribe()
        })
      } catch (err) {
        console.error('Error setting up posts listener:', err)
        error.value = 'Failed to load posts'
        loading.value = false
      }
    }

    const createPost = async () => {
      if (!db) {
        error.value = 'Firestore not initialized'
        return
      }

      if (!isAuthenticated.value) {
        error.value = 'Please sign in to create a post'
        return
      }

      try {
        const postData = {
          authorName: newPost.value.authorName || userDisplayName.value,
          content: newPost.value.content,
          createdAt: Timestamp.now(),
          userId: userId.value, // Use Google Auth UID
          userEmail: userEmail.value,
          displayName: newPost.value.authorName || userDisplayName.value,
          genreString: newPost.value.genreString || '',
          isMatched: false, // New posts start as unmatched
          levelString: newPost.value.levelString || '',
          location: newPost.value.location,
          songIdsString: newPost.value.songIdsString || '',
          title: newPost.value.title
        }

        await addDoc(collection(db, 'posts'), postData)
        
        // Reset form
        newPost.value = {
          authorName: '',
          location: '',
          title: '',
          content: '',
          displayName: '',
          genreString: '',
          levelString: '',
          songIdsString: '',
          isMatched: false,
          createdAt: Timestamp.now()
        }

        // Increment post count
        await incrementPostsCount()
      } catch (err) {
        console.error('Error creating post:', err)
        error.value = 'Failed to create post'
      }
    }

    onMounted(() => {
      loadPosts()
    })

    return {
      posts,
      loading,
      error,
      locations,
      newPost,
      createPost,
      formatTime,
      isAuthenticated,
      userDisplayName
    }
  }
})
</script>

<style scoped>
.forum-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.create-post {
  margin-bottom: 2rem;
}

.auth-required {
  text-align: center;
  padding: 1.5rem;
  border: 1px solid var(--system-accent);
  background: rgba(255, 0, 255, 0.05);
  margin-bottom: 1.5rem;
}

.auth-required p:first-child {
  color: var(--system-accent);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.user-status {
  text-align: center;
  padding: 0.75rem;
  border: 1px solid var(--system-glitch);
  background: rgba(0, 255, 255, 0.05);
  margin-bottom: 1.5rem;
}

.posting-as {
  color: var(--system-text);
  font-size: 0.9rem;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-form.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--system-accent);
  font-size: 0.9rem;
  text-transform: uppercase;
}

.post-card {
  border: 1px solid var(--system-border);
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--system-bg);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.post-location {
  color: var(--system-glitch);
  font-weight: bold;
}

.post-time {
  color: var(--system-accent);
  opacity: 0.8;
  font-size: 0.8rem;
}

.post-title {
  color: var(--system-text);
  margin: 0.5rem 0;
}

.post-content {
  color: var(--system-text);
  opacity: 0.9;
  line-height: 1.6;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.readonly-input {
  background: var(--system-bg) !important;
  border: 1px solid var(--system-border) !important;
  color: var(--system-accent) !important;
  opacity: 0.7;
  cursor: not-allowed;
}

.readonly-input:focus {
  outline: none;
  border-color: var(--system-accent) !important;
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
  color: var(--system-accent);
  font-size: 0.8rem;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--system-accent);
  background: transparent;
}

.match-status.matched {
  color: var(--system-glitch);
  border-color: var(--system-glitch);
  background: rgba(0, 255, 255, 0.1);
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

.cyber-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--system-bg);
  border: 1px solid var(--system-border);
  color: var(--system-text);
  font-family: "Courier New", monospace;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.cyber-input:focus {
  outline: none;
  border-color: var(--system-accent);
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.3);
}

.cyber-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--system-border);
  color: var(--system-text);
}

.submit-btn:disabled:hover {
  background: var(--system-border);
  animation: none;
}
</style> 