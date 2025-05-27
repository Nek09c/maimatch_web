<script lang="ts">
import { defineComponent, ref, onMounted, getCurrentInstance } from 'vue'
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'

interface Post {
  id: string;
  location: string;
  title: string;
  content: string;
  timestamp: Timestamp;
}

export default defineComponent({
  name: 'Home',
  setup() {
    const instance = getCurrentInstance()
    const db = instance?.appContext.config.globalProperties.$db
    const posts = ref<Post[]>([])

    const formatTime = (timestamp: Timestamp) => {
      const now = new Date()
      const postTime = timestamp.toDate()
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
        console.error('Firestore not initialized')
        return
      }

      try {
        const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'))
        const querySnapshot = await getDocs(q)
        posts.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[]
      } catch (error) {
        console.error('Error loading posts:', error)
      }
    }

    onMounted(() => {
      loadPosts()
    })

    return {
      posts,
      formatTime
    }
  }
})
</script> 