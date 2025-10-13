<template>
  <div class="forum-container">
    <div class="cyber-box create-post">
      <h3>開始MaiMatch！</h3>
      
      <!-- Authentication check -->
      <div v-if="!isAuthenticated" class="auth-required">
        <p class="glitch">⚠️ 需要登入</p>
        <p>請用 Google 登入先可以同人MaiMatch</p>
      </div>
      
      <div v-else class="user-status">
        <p class="posting-as">Default稱呼: <span class="glitch">{{ userDisplayName }}</span></p>
      </div>
      
      <form @submit.prevent="createPost" class="post-form" :class="{ disabled: !isAuthenticated }">
        <div class="form-group">
          <label for="authorName">稱呼/Maimai名 (可選填, default會係Google名)</label>
          <input
            type="text" 
            id="authorName"
            ref="inputElement"
            :value="inputValue"
            @keydown="handleKeyPress"
            @paste="handlePaste"
            :disabled="!isAuthenticated"
            class="cyber-input"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
        
        <div class="form-group">
          <label for="location">機舖</label>
          <select 
            id="location"
            v-model="newPost.location" 
            required 
            :disabled="!isAuthenticated"
            class="cyber-input"
          >
            <option value="">選擇機舖</option>
            <option v-for="location in locations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="content">內容</label>
          <textarea 
            id="content"
            v-model="newPost.content" 
            required 
            :disabled="!isAuthenticated"
            placeholder="講下目的（想吸多個印仔/單純想打四首歌/想處xxx歌/打段位...） + 描述下自己著咩衫/企係邊 令人容易啲認到你..."
            class="cyber-input"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="genreString">最愛嘅類別 (可選填)</label>
          <select 
            id="genreString"
            v-model="newPost.genreString" 
            :disabled="!isAuthenticated"
            class="cyber-input"
          >
            <option value="">選擇類別</option>
            <option value="Pop & Anime">Pop & Anime</option>
            <option value="Niconico & Vocaloid">Niconico & Vocaloid</option>
            <option value="東方project">東方project</option>
            <option value="Game & Variety">Game & Variety</option>
            <option value="Maimai">Maimai</option>
            <option value="Ongeki & Chunithm">Ongeki & Chunithm</option>
            <option value="宴会場">宴会場</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="levelString">打到咩Level(可選填)</label>
          <select 
            id="levelString"
            v-model="newPost.levelString" 
            :disabled="!isAuthenticated"
            class="cyber-input"
          >
            <option value="">選擇LEVEL</option>
            <option v-for="lvl in levelOptions" :key="lvl" :value="lvl">{{ lvl }}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="songIdsString">想指定打嘅歌曲 (可選填)</label>
          <div class="song-selection">
            <select 
              id="songGenre"
              v-model="selectedSongGenre" 
              :disabled="!isAuthenticated"
              class="cyber-input"
            >
              <option value="">選擇歌曲類別</option>
              <option value="popAndAnime">Pop & Anime</option>
              <option value="niconicoAndVocaloid">Niconico & Vocaloid</option>
              <option value="touhou">東方project</option>
              <option value="gameAndVariety">Game & Variety</option>
              <option value="maimai">Maimai</option>
              <option value="ongekiAndChunithm">Ongeki & Chunithm</option>
              <option value="partyRoom">宴会場</option>
            </select>
            
            <div v-if="selectedSongGenre" class="selected-songs">
              <div class="selected-songs-header">
                <h4>已選歌曲</h4>
                <button 
                  type="button" 
                  @click="clearSelectedSongs" 
                  class="clear-songs"
                  :disabled="!isAuthenticated"
                >
                  清除
                </button>
              </div>
              <div class="song-list">
                <div v-for="song in filteredSongs" :key="song.id" class="song-item">
                  <input 
                    type="checkbox" 
                    :id="song.id"
                    :value="song.title"
                    v-model="selectedSongs"
                    :disabled="!isAuthenticated"
                  />
                  <label :for="song.id">{{ song.title }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          class="cyber-button submit-btn" 
          :disabled="!isAuthenticated"
        >
          {{ isAuthenticated ? '發文' : 'SIGN IN TO POST' }}
        </button>
      </form>
    </div>

    <div class="cyber-box posts-list">
      <h3>活躍連接</h3>
      <div v-if="loading" class="loading">載入中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="posts.length === 0" class="no-posts">冇搵到連接</div>
      <div v-else v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <span class="post-location glitch">{{ post.location }}</span>
          <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>
        <div class="post-author">
          <span class="author-name">{{ post.authorName }}</span>
          <button 
            v-if="isAuthenticated && userId === post.userId"
            @click="togglePostStatus(post)"
            class="match-status clickable" 
            :class="{ matched: post.isMatched }"
            :title="post.isMatched ? '點擊標記為已完' : '點擊標記為已搵到'"
          >
            {{ post.isMatched ? '✓ 已搵到' : '○ 搵緊' }}
          </button>
          <span 
            v-else
            class="match-status" 
            :class="{ matched: post.isMatched }"
          >
            {{ post.isMatched ? '✓ 已搵到' : '○ 搵緊' }}
          </span>
        </div>
        <h4 class="post-title">{{ post.title }}</h4>
        <p class="post-content">{{ post.content }}</p>
        <div class="post-details" v-if="post.genreString || post.levelString || post.songIdsString">
          <div class="detail-row" v-if="post.genreString">
            <span class="detail-label">類型：</span>
            <span class="detail-value">{{ post.genreString }}</span>
          </div>
          <div class="detail-row" v-if="post.levelString">
            <span class="detail-label">難度：</span>
            <span class="detail-value">{{ post.levelString }}</span>
          </div>
          <div class="detail-row" v-if="post.songIdsString">
            <span class="detail-label">歌曲：</span>
            <span class="detail-value">{{ post.songIdsString }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, getCurrentInstance, computed, watch, nextTick } from 'vue'
import { collection, addDoc, getDocs, query, orderBy, Timestamp, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'
import { useUserProfile } from '../composables/useUserProfile'
import { useRouter } from 'vue-router'
import { getAllSongs } from '@/utils/database'

interface Post {
  id: string;
  authorName: string;
  title: string;
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

}

interface Song {
  id: string;
  title: string;
  category: string;
}

export default defineComponent({
  name: 'Forum',
  setup() {
    const router = useRouter()
    const instance = getCurrentInstance()
    const db = instance?.appContext.config.globalProperties.$db
    const { isAuthenticated, userId, userDisplayName, userEmail } = useAuth()
    const { incrementPostsCount } = useUserProfile()
    
    const posts = ref<Post[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)
    const levelOptions = [
      '1+', '2+', '3+', '4+', '5+', '6+', '7+', '8+', '9+', '10+', '11+', '12+', '13+', '14+'
    ]
    const locations = [
      '旺角新之城',
      '旺角金雞',
      '荃灣金星',
      '佐敦GAMEZONE',
      '鑽石山鑽荷',
      '長沙灣龍威',
      '觀塘觀廣',
      '觀塘168',
      '沙田沙龍',
      '深水埗電子',
      '天水圍PC',
      '尖沙嘴RETROCITY',
      '尖沙嘴新港',
      '屯門天天',
      '大埔IGAME',
      '油麻地金星',
      '灣仔SG',
      '西灣河太安樓',      
      '葵涌碧富',
      '香港仔珍寶',
    ]

    // Song data from database
    const allSongs = ref<Song[]>([])
    
    // Load songs from database
    const loadSongs = async () => {
      try {
        allSongs.value = await getAllSongs()
      } catch (error) {
        console.error('Error loading songs:', error)
      }
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
      isMatched: false,
      createdAt: Timestamp.now()
    })

    const customAuthorNameInput = ref('')
    const inputValue = ref('')
    const inputElement = ref<HTMLInputElement | null>(null)

    const updateValue = (value: string) => {
      inputValue.value = value
      customAuthorNameInput.value = value
      newPost.value.authorName = value
      
      // Force update the DOM element
      nextTick(() => {
        if (inputElement.value) {
          inputElement.value.value = value
        }
      })
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault() // Prevent default input behavior
      const key = e.key
      
      // Only handle printable characters
      if (key.length === 1) {
        const newValue = inputValue.value + key
        updateValue(newValue)
      } else if (key === 'Backspace') {
        const newValue = inputValue.value.slice(0, -1)
        updateValue(newValue)
      }
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      const pastedText = e.clipboardData?.getData('text') || ''
      const newValue = inputValue.value + pastedText
      updateValue(newValue)
    }

    const selectedSongGenre = ref('')
    const selectedSongs = ref<string[]>([])

    // Computed property to filter songs based on selected genre
    const filteredSongs = computed(() => {
      if (!selectedSongGenre.value) return []
      return allSongs.value.filter(song => song.category === selectedSongGenre.value)
    })

    // Watch for changes in selectedSongs to update the form
    watch(selectedSongs, (newSongs) => {
      newPost.value.songIdsString = newSongs.join(', ')
    })

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
        // Log the complete form state
        console.log('Complete form state:', {
          customAuthorName: customAuthorNameInput.value,
          formAuthorName: newPost.value.authorName,
          userDisplayName: userDisplayName.value
        });

        // Get the trimmed author name from the input ref
        const customAuthorName = customAuthorNameInput.value.trim();
        
        // Use the custom name if provided, otherwise use Google display name
        const finalAuthorName = customAuthorName || userDisplayName.value;
        
        console.log('Author name details:', {
          customAuthorName,
          userDisplayName: userDisplayName.value,
          finalAuthorName
        });
        
        const postData = {
          authorName: finalAuthorName,
          content: newPost.value.content,
          createdAt: Timestamp.now(),
          userId: userId.value,
          userEmail: userEmail.value,
          displayName: userDisplayName.value,
          genreString: newPost.value.genreString || '',
          isMatched: false,
          levelString: newPost.value.levelString || '',
          location: newPost.value.location,
          songIdsString: selectedSongs.value.join(', '),
          title: newPost.value.title
        }

        console.log('Final post data:', postData);

        await addDoc(collection(db, 'posts'), postData)
        
        // Reset form
        customAuthorNameInput.value = '';
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

        // Reset song selections
        selectedSongGenre.value = ''
        selectedSongs.value = []

        // Increment post count
        await incrementPostsCount()

        // Navigate to AllPosts view
        router.push('/posts')
      } catch (err) {
        console.error('Error creating post:', err)
        error.value = 'Failed to create post'
      }
    }

    const clearSelectedSongs = () => {
      selectedSongs.value = []
    }

    const removeSong = (songTitle: string) => {
      const index = selectedSongs.value.indexOf(songTitle)
      if (index > -1) {
        selectedSongs.value.splice(index, 1)
      }
    }

    const togglePostStatus = async (post: Post) => {
      if (!db) {
        error.value = 'Firestore not initialized'
        return
      }

      try {
        const postRef = doc(db, 'posts', post.id)
        await updateDoc(postRef, {
          isMatched: !post.isMatched
        })
        
        console.log('Post status updated successfully')
      } catch (err) {
        console.error('Error toggling post status:', err)
        error.value = 'Failed to toggle post status'
      }
    }

    onMounted(() => {
      loadPosts()
      loadSongs()
      // Get reference to input element
      inputElement.value = document.getElementById('authorName') as HTMLInputElement
      if (inputElement.value) {
        console.log('Input element found and referenced')
      }
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
      userId,
      userDisplayName,
      selectedSongGenre,
      selectedSongs,
      filteredSongs,
      levelOptions,
      clearSelectedSongs,
      removeSong,
      togglePostStatus,
      customAuthorNameInput,
      inputValue,
      handleKeyPress,
      handlePaste,
      updateValue
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

.match-status.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--system-bg);
  font-family: "Courier New", monospace;
  text-transform: uppercase;
  position: relative;
  padding-right: 1.5rem;
}

.match-status.clickable::after {
  content: '⇋';
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  opacity: 0.8;
  text-shadow: 0 0 8px var(--system-accent);
}

.match-status.clickable:hover {
  background: var(--system-accent);
  color: var(--system-bg);
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.5), 
              inset 0 0 5px rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  border-width: 2px;
}

.match-status.clickable.matched::after {
  text-shadow: 0 0 8px var(--system-glitch);
}

.match-status.clickable.matched:hover {
  background: var(--system-glitch);
  color: var(--system-bg);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5),
              inset 0 0 5px rgba(255, 255, 255, 0.5);
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

.song-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--system-border);
  background: rgba(0, 0, 0, 0.3);
}

.song-list label {
  color: var(--system-accent);
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.song-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--system-border);
  background: var(--system-bg);
}

.song-checkbox {
  display: flex;
  align-items: center;
  padding: 0.25rem;
  transition: all 0.3s ease;
}

.song-checkbox:hover {
  background: rgba(255, 0, 255, 0.1);
}

.cyber-checkbox {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid var(--system-border);
  background: var(--system-bg);
  margin-right: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cyber-checkbox:checked {
  background: var(--system-accent);
  border-color: var(--system-accent);
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
}

.cyber-checkbox:checked::after {
  content: '✓';
  color: var(--system-bg);
  font-size: 12px;
  font-weight: bold;
  display: block;
  text-align: center;
  line-height: 14px;
}

.cyber-checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.song-label {
  color: var(--system-text);
  font-size: 0.8rem;
  cursor: pointer;
  user-select: none;
  flex: 1;
  transition: color 0.3s ease;
}

.song-label:hover {
  color: var(--system-accent);
}

.selected-count {
  text-align: right;
  color: var(--system-glitch);
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--system-glitch);
  background: rgba(0, 255, 255, 0.1);
  width: fit-content;
  margin-left: auto;
}

.selected-songs-display {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--system-accent);
  background: rgba(255, 0, 255, 0.05);
}

.selected-songs-display h5 {
  color: var(--system-accent);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.selected-song-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.song-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: var(--system-glitch);
  color: var(--system-bg);
  font-size: 0.75rem;
  border-radius: 2px;
  font-weight: bold;
}

.remove-song-btn {
  margin-left: 0.5rem;
  background: transparent;
  border: none;
  color: var(--system-bg);
  cursor: pointer;
  font-weight: bold;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-song-btn:hover {
  background: rgba(0, 0, 0, 0.3);
}

.selected-songs {
  border: 1px solid var(--system-border);
  background: rgba(0, 0, 0, 0.2);
  margin-top: 1rem;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.selected-songs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--system-bg);
  border-bottom: 1px solid var(--system-border);
}

.selected-songs-header h4 {
  margin: 0;
  color: var(--system-accent);
  font-size: 0.9rem;
  text-transform: uppercase;
}

.clear-songs {
  background: transparent;
  border: 1px solid var(--system-accent);
  color: var(--system-accent);
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Courier New", monospace;
}

.clear-songs:hover {
  background: var(--system-accent);
  color: var(--system-bg);
}

.clear-songs:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.song-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.5rem;
  align-content: start;
}

.song-list::-webkit-scrollbar {
  width: 8px;
}

.song-list::-webkit-scrollbar-track {
  background: var(--system-bg);
}

.song-list::-webkit-scrollbar-thumb {
  background: var(--system-accent);
  border-radius: 4px;
}

.song-list::-webkit-scrollbar-thumb:hover {
  background: var(--system-glitch);
}

.song-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.song-item:hover {
  background: rgba(255, 0, 255, 0.1);
}

.song-item input[type="checkbox"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid var(--system-accent);
  background: var(--system-bg);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.song-item input[type="checkbox"]:checked {
  background: var(--system-accent);
  border-color: var(--system-accent);
}

.song-item input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  color: var(--system-bg);
  font-size: 12px;
  font-weight: bold;
  left: 2px;
  top: -1px;
}

.song-item input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.song-item label {
  flex: 1;
  color: var(--system-text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-item:hover label {
  color: var(--system-accent);
}
</style> 