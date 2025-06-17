<template>
  <div class="locations-container">
    <div class="locations-grid">
      <div v-for="location in locations" :key="location.id" class="cyber-box location-card">
        <h4 class="glitch">{{ location.name }}</h4>
        <div class="location-info">
          <p class="location-address">{{ location.address }}</p>
          <p class="location-hours">營業時間：{{ location.hours }}</p>
          <p class="location-machines">機台數量：{{ location.machines }}</p>
        </div>
        <div class="location-stats">
          <div class="stat">
            <span class="stat-label">總共貼文</span>
            <span class="stat-value">{{ location.totalPosts }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">今日貼文</span>
            <span class="stat-value">{{ location.todayPosts }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, getCurrentInstance } from 'vue'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'

interface Location {
  id: number;
  name: string;
  address: string;
  hours: string;
  machines: string;
  totalPosts: number;
  todayPosts: number;
}

export default defineComponent({
  name: 'Locations',
  setup() {
    const locations = ref<Location[]>([
      {
        id: 1,
        name: '鑽石山',
        address: '鑽石山荷里活廣場',
        hours: '10:00 - 22:00',
        machines: '4',
        totalPosts: 0,
        todayPosts: 0
      },
      {
        id: 2,
        name: '旺角新之城',
        address: '旺角彌敦道新之城',
        hours: '11:00 - 23:00',
        machines: '6',
        totalPosts: 0,
        todayPosts: 0
      },
      {
        id: 3,
        name: '旺角 Smart Games',
        address: '旺角彌敦道 Smart Games',
        hours: '11:00 - 23:00',
        machines: '4',
        totalPosts: 0,
        todayPosts: 0
      },
      {
        id: 4,
        name: '荃金',
        address: '荃灣荃金商場',
        hours: '10:00 - 22:00',
        machines: '4',
        totalPosts: 0,
        todayPosts: 0
      },
      {
        id: 5,
        name: '大埔李福林',
        address: '大埔李福林體育館',
        hours: '10:00 - 22:00',
        machines: '2',
        totalPosts: 0,
        todayPosts: 0
      },
      {
        id: 6,
        name: '油麻地金星',
        address: '油麻地彌敦道金星',
        hours: '11:00 - 23:00',
        machines: '4',
        totalPosts: 0,
        todayPosts: 0
      },
      {
        id: 7,
        name: '旺角金雞',
        address: '旺角彌敦道金雞',
        hours: '11:00 - 23:00',
        machines: '4',
        totalPosts: 0,
        todayPosts: 0
      },
      {
        id: 8,
        name: '灣仔金星',
        address: '灣仔軒尼詩道金星',
        hours: '11:00 - 23:00',
        machines: '4',
        totalPosts: 0,
        todayPosts: 0
      }
    ])

    const loadLocationStats = async () => {
      try {
        const instance = getCurrentInstance()
        const db = instance?.appContext.config.globalProperties.$db
        
        if (!db) {
          console.error('Firestore not initialized')
          return
        }

        // Calculate timestamp for start of today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTimestamp = Timestamp.fromDate(today)

        // Get all posts
        const allPostsSnapshot = await getDocs(collection(db, 'posts'))
        
        // Count posts by location
        const locationCounts: { [key: string]: { total: number, today: number } } = {}
        
        allPostsSnapshot.forEach((doc) => {
          const postData = doc.data()
          const location = postData.location
          
          if (!locationCounts[location]) {
            locationCounts[location] = { total: 0, today: 0 }
          }
          
          locationCounts[location].total++
          
          // Check if post was created today
          if (postData.createdAt && postData.createdAt >= todayTimestamp) {
            locationCounts[location].today++
          }
        })

        // Update location stats
        locations.value = locations.value.map(location => ({
          ...location,
          totalPosts: locationCounts[location.name]?.total || 0,
          todayPosts: locationCounts[location.name]?.today || 0
        }))

        console.log('Location stats loaded:', locationCounts)
      } catch (error) {
        console.error('Error loading location stats:', error)
      }
    }

    onMounted(() => {
      loadLocationStats()
    })

    return {
      locations
    }
  }
})
</script>

<style scoped>
.locations-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
}

.locations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.location-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--lain-bg);
  border: 1px solid var(--lain-accent);
  transition: all 0.3s ease;
}

.location-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.1);
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.location-address {
  color: var(--lain-text);
  opacity: 0.9;
  font-size: 1rem;
}

.location-hours, .location-machines {
  color: var(--lain-accent);
  font-size: 0.9rem;
}

.location-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--lain-accent);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--lain-text);
  opacity: 0.8;
}

.stat-value {
  color: var(--lain-accent);
  font-size: 1.2rem;
}

@media screen and (max-width: 768px) {
  .locations-grid {
    grid-template-columns: 1fr;
  }
  
  .location-card {
    padding: 1rem;
  }
}
</style> 