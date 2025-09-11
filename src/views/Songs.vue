<template>
  <div class="songs-container">
    <div class="cyber-box search-section">
      <h3>歌曲庫</h3>
      <div class="search-controls">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="我想搵..."
          class="search-input"
        >
        <select v-model="selectedCategory" class="category-select">
          <option value="">所有分類</option>
          <option v-for="category in categories" :key="category.key" :value="category.key">
            {{ category.name }} ({{ getCategoryCount(category.key) }})
          </option>
        </select>
      </div>
      <div class="stats-bar">
        <span class="total-songs">總歌曲數量: {{ filteredSongs.length }} / {{ allSongs.length }}</span>
        <span v-if="loading" class="loading-indicator">Loading songs from database...</span>
      </div>
      
      <div class="acknowledgment-bar">
        <span class="acknowledgment-text">
          📊 Data sourced from: 
          <a 
            href="https://github.com/zetaraku/arcade-songs-fetch" 
            target="_blank" 
            rel="noopener noreferrer"
            class="acknowledgment-link"
          >
            @zetaraku/arcade-songs-fetch
          </a>
        </span>
      </div>
    </div>

    <div class="songs-grid">
      <div v-for="song in paginatedSongs" :key="song.id" class="cyber-box song-card">
        <div class="song-header">
          <h4 class="song-title glitch">{{ song.title }}</h4>
          <span class="song-category">{{ getCategoryName(song.category) }}</span>
        </div>
        <div class="song-info">
          <p class="song-id">ID: {{ song.id }}</p>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button 
        @click="currentPage = Math.max(1, currentPage - 1)" 
        :disabled="currentPage === 1"
        class="cyber-button page-btn"
      >
        PREV
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        @click="currentPage = Math.min(totalPages, currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="cyber-button page-btn"
      >
        NEXT
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import { getAllSongs } from '@/utils/database'

interface Song {
  id: string;
  title: string;
  category: string;
}

export default defineComponent({
  name: 'Songs',
  setup() {
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const currentPage = ref(1)
    const songsPerPage = 50
    const allSongs = ref<Song[]>([])
    const loading = ref(true)
    
    const categories = [
      { key: 'ongekiAndChunithm', name: 'ONGEKI & CHUNITHM' },
      { key: 'touhou', name: 'TOUHOU PROJECT' },
      { key: 'popAndAnime', name: 'POP & ANIME' },
      { key: 'maimai', name: 'MAIMAI ORIGINAL' },
      { key: 'niconicoAndVocaloid', name: 'NICONICO & VOCALOID' },
      { key: 'gameAndVariety', name: 'GAME & VARIETY' }
    ]

    // Load songs from database
    const loadSongs = async () => {
      try {
        loading.value = true
        allSongs.value = await getAllSongs()
      } catch (error) {
        console.error('Error loading songs:', error)
      } finally {
        loading.value = false
      }
    }

    const filteredSongs = computed(() => {
      return allSongs.value.filter(song => {
        const matchesSearch = song.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            song.id.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = !selectedCategory.value || song.category === selectedCategory.value
        return matchesSearch && matchesCategory
      })
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredSongs.value.length / songsPerPage)
    })

    const paginatedSongs = computed(() => {
      const start = (currentPage.value - 1) * songsPerPage
      const end = start + songsPerPage
      return filteredSongs.value.slice(start, end)
    })

    const getCategoryCount = (categoryKey: string) => {
      return allSongs.value.filter(song => song.category === categoryKey).length
    }

    const getCategoryName = (categoryKey: string) => {
      const category = categories.find(cat => cat.key === categoryKey)
      return category ? category.name : categoryKey
    }

    // Reset pagination when filter changes
    watch([searchQuery, selectedCategory], () => {
      currentPage.value = 1
    })

    // Load songs on component mount
    onMounted(() => {
      loadSongs()
    })

    return {
      searchQuery,
      selectedCategory,
      currentPage,
      categories,
      allSongs,
      filteredSongs,
      paginatedSongs,
      totalPages,
      getCategoryCount,
      getCategoryName,
      loading
    }
  }
})
</script>

<style scoped>
.songs-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.search-input, .category-select {
  flex: 1;
  min-width: 250px;
  padding: 0.75rem;
  background: var(--system-bg);
  border: 1px solid var(--lain-accent);
  color: var(--lain-text);
  font-family: "Courier New", monospace;
  text-transform: uppercase;
}

.search-input:focus, .category-select:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(242, 242, 242, 0.5);
}

.stats-bar {
  margin-top: 1rem;
  padding: 0.5rem 0;
  border-top: 1px solid var(--lain-accent);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-songs {
  color: var(--lain-accent);
  font-size: 0.9rem;
}

.loading-indicator {
  color: var(--lain-glitch);
  font-size: 0.8rem;
  font-style: italic;
}

.acknowledgment-bar {
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  border-top: 1px solid rgba(242, 242, 242, 0.2);
  text-align: center;
}

.acknowledgment-text {
  color: var(--lain-text);
  font-size: 0.8rem;
  opacity: 0.8;
}

.acknowledgment-link {
  color: var(--lain-accent);
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  font-family: "Courier New", monospace;
}

.acknowledgment-link:hover {
  color: var(--lain-glitch);
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  text-decoration: underline;
}

.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.song-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  transition: all 0.3s ease;
}

.song-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(242, 242, 242, 0.3);
}

.song-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.song-title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.2;
  flex: 1;
  word-break: break-word;
}

.song-category {
  color: var(--lain-glitch);
  font-size: 0.7rem;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0.8;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.song-id {
  color: var(--lain-text);
  opacity: 0.7;
  font-size: 0.8rem;
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  min-width: 80px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--lain-accent);
  font-size: 1.1rem;
  padding: 0 1rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
  }
  
  .search-input, .category-select {
    min-width: 100%;
  }
  
  .songs-grid {
    grid-template-columns: 1fr;
  }
  
  .song-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .stats-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style> 