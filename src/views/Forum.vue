<template>
  <div class="forum-container">
    <div class="cyber-box create-post">
      <h3>CREATE NEW CONNECTION</h3>
      <form @submit.prevent="createPost" class="post-form">
        <div class="form-group">
          <label>AUTHOR NAME</label>
          <input type="text" v-model="newPost.authorName" required placeholder="ENTER YOUR NAME">
        </div>
        <div class="form-group">
          <label>LOCATION</label>
          <select v-model="newPost.location" required>
            <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>TITLE</label>
          <input type="text" v-model="newPost.title" required placeholder="ENTER POST TITLE">
        </div>
        <div class="form-group">
          <label>CONTENT</label>
          <textarea v-model="newPost.content" required placeholder="ENTER YOUR MESSAGE"></textarea>
        </div>
        <div class="form-group">
          <label>GENRES</label>
          <input type="text" v-model="newPost.genreString" placeholder="e.g., 東方project|Game & Variety|Maimai">
        </div>
        <div class="form-group">
          <label>LEVELS</label>
          <input type="text" v-model="newPost.levelString" placeholder="e.g., 10-12+">
        </div>
        <div class="form-group">
          <label>SONG IDS</label>
          <input type="text" v-model="newPost.songIdsString" placeholder="e.g., n_232,t_2,g_146,m_131">
        </div>
        <div class="form-group">
          <label>DEVICE ID</label>
          <input type="text" v-model="newPost.deviceId" readonly placeholder="Generating unique ID..." class="readonly-input">
          <small style="color: var(--system-accent); font-size: 0.7rem;">Auto-generated unique identifier</small>
        </div>
        <button type="submit" class="cyber-button">TRANSMIT</button>
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
import { collection, addDoc, getDocs, query, orderBy, Timestamp, onSnapshot, where } from 'firebase/firestore'

interface Post {
  id: string;
  authorName: string;
  content: string;
  createdAt: any; // Firebase Timestamp
  creator: any; // Reference
  deviceId: string;
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

    const generateDeviceId = async () => {
      const generateRandomId = () => {
        return 'WEB-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      }

      if (!db) {
        console.warn('Database not available, generating random ID without duplicate check')
        return generateRandomId()
      }

      let deviceId = generateRandomId()
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts) {
        try {
          // Check if this deviceId already exists in the posts collection
          const q = query(collection(db, 'posts'), where('deviceId', '==', deviceId))
          const querySnapshot = await getDocs(q)
          
          if (querySnapshot.empty) {
            // No duplicate found, this deviceId is unique
            console.log('Generated unique deviceId:', deviceId)
            return deviceId
          } else {
            // Duplicate found, generate a new one
            console.log('Duplicate deviceId found, generating new one...')
            deviceId = generateRandomId()
            attempts++
          }
        } catch (error) {
          console.error('Error checking deviceId uniqueness:', error)
          // If there's an error checking, just return the current ID
          return deviceId
        }
      }

      // If we've tried too many times, just return the last generated ID
      console.warn('Max attempts reached for unique deviceId generation, using:', deviceId)
      return deviceId
    }

    const newPost = ref({
      authorName: '',
      location: '',
      title: '',
      content: '',
      displayName: '',
      genreString: '',
      levelString: '',
      songIdsString: '',
      deviceId: '',
      isMatched: false,
      creator: null,
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

      try {
        // Generate a unique deviceId for this post
        const uniqueDeviceId = await generateDeviceId()

        const postData = {
          authorName: newPost.value.authorName,
          content: newPost.value.content,
          createdAt: Timestamp.now(),
          creator: null, // You might want to implement user references later
          deviceId: uniqueDeviceId,
          displayName: newPost.value.authorName, // Use authorName as displayName
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
          deviceId: '',
          isMatched: false,
          creator: null,
          createdAt: Timestamp.now()
        }
      } catch (err) {
        console.error('Error creating post:', err)
        error.value = 'Failed to create post'
      }
    }

    onMounted(() => {
      loadPosts()
      // Initialize a deviceId for the current session
      initializeDeviceId()
    })

    const initializeDeviceId = async () => {
      try {
        const deviceId = await generateDeviceId()
        newPost.value.deviceId = deviceId
      } catch (error) {
        console.error('Error initializing deviceId:', error)
        newPost.value.deviceId = 'WEB-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      }
    }

    return {
      posts,
      locations,
      newPost,
      createPost,
      formatTime,
      loading,
      error
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

.post-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
</style> 