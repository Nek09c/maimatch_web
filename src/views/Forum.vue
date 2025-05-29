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
          <select 
            id="genreString"
            v-model="newPost.genreString" 
            :disabled="!isAuthenticated"
            class="cyber-input"
          >
            <option value="">SELECT GENRE</option>
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
          <div class="song-selection">
            <select 
              id="songGenre"
              v-model="selectedSongGenre" 
              :disabled="!isAuthenticated"
              class="cyber-input"
            >
              <option value="">ALL GENRES</option>
              <option value="popAndAnime">Pop & Anime</option>
              <option value="niconicoAndVocaloid">Niconico & Vocaloid</option>
              <option value="touhou">東方project</option>
              <option value="gameAndVariety">Game & Variety</option>
              <option value="maimai">Maimai</option>
              <option value="ongekiAndChunithm">Ongeki & Chunithm</option>
            </select>
            
            <div class="song-list">
              <label>Select up to 4 songs (from any genre):</label>
              <div class="song-checkboxes">
                <div 
                  v-for="song in filteredSongs" 
                  :key="song.id" 
                  class="song-checkbox"
                >
                  <input 
                    type="checkbox" 
                    :id="song.id"
                    :value="song.title"
                    v-model="selectedSongs"
                    :disabled="!isAuthenticated || (selectedSongs.length >= 4 && !selectedSongs.includes(song.title))"
                    class="cyber-checkbox"
                  />
                  <label :for="song.id" class="song-label">{{ song.title }}</label>
                </div>
              </div>
              <div class="selected-songs-display" v-if="selectedSongs.length > 0">
                <h5>Selected Songs:</h5>
                <div class="selected-song-tags">
                  <span 
                    v-for="(song, index) in selectedSongs" 
                    :key="index"
                    class="song-tag"
                  >
                    {{ song }}
                    <button 
                      @click="removeSong(song)"
                      class="remove-song-btn"
                      type="button"
                    >×</button>
                  </span>
                </div>
              </div>
              <div class="selected-count">
                Selected: {{ selectedSongs.length }}/4
              </div>
            </div>
          </div>
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
          <span class="author-name">{{ post.authorName }}</span>
          <button 
            v-if="isAuthenticated && userId === post.userId"
            @click="togglePostStatus(post)"
            class="match-status clickable" 
            :class="{ matched: post.isMatched }"
            :title="post.isMatched ? 'Click to mark as CLOSE' : 'Click to mark as MATCHED'"
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
import { defineComponent, ref, onMounted, onUnmounted, getCurrentInstance, computed, watch, nextTick } from 'vue'
import { collection, addDoc, getDocs, query, orderBy, Timestamp, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'
import { useUserProfile } from '../composables/useUserProfile'
import { useRouter } from 'vue-router'

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

    // Song data - complete songs for each category from Songs.vue
    const allSongs: Song[] = [
      // Ongeki & Chunithm songs (117 songs)
      { id: "o_1", title: "STARTLINER", category: "ongekiAndChunithm" },
      { id: "o_2", title: "Jump!! Jump!! Jump!!", category: "ongekiAndChunithm" },
      { id: "o_3", title: "Titania", category: "ongekiAndChunithm" },
      { id: "o_4", title: "Change Our MIRAI！", category: "ongekiAndChunithm" },
      { id: "o_5", title: "無敵We are one!!", category: "ongekiAndChunithm" },
      { id: "o_6", title: "ドキドキDREAM!!!", category: "ongekiAndChunithm" },
      { id: "o_7", title: "Still", category: "ongekiAndChunithm" },
      { id: "o_8", title: "Session High⤴", category: "ongekiAndChunithm" },
      { id: "o_9", title: "Agitation！", category: "ongekiAndChunithm" },
      { id: "o_10", title: "管弦楽組曲 第3番 ニ長調「第2曲（G線上のアリア）」BWV.1068-2", category: "ongekiAndChunithm" },
      { id: "o_11", title: "ハート・ビート", category: "ongekiAndChunithm" },
      { id: "o_12", title: "brilliant better", category: "ongekiAndChunithm" },
      { id: "o_13", title: "フォルテシモBELL", category: "ongekiAndChunithm" },
      { id: "o_14", title: "DETARAME ROCK&ROLL THEORY", category: "ongekiAndChunithm" },
      { id: "o_15", title: "私の中の幻想的世界観及びその顕現を想起させたある現実での出来事に関する一考察", category: "ongekiAndChunithm" },
      { id: "o_16", title: "猛進ソリストライフ！", category: "ongekiAndChunithm" },
      { id: "o_17", title: "My Dearest Song", category: "ongekiAndChunithm" },
      { id: "o_18", title: "SPICY SWINGY STYLE", category: "ongekiAndChunithm" },
      { id: "o_19", title: "Bang Babang Bang!!!", category: "ongekiAndChunithm" },
      { id: "o_20", title: "Tic Tac DREAMIN'", category: "ongekiAndChunithm" },
      { id: "o_21", title: "猫祭り", category: "ongekiAndChunithm" },
      { id: "o_22", title: "TRUST", category: "ongekiAndChunithm" },
      { id: "o_23", title: "奏者はただ背中と提琴で語るのみ", category: "ongekiAndChunithm" },
      { id: "o_24", title: "イロトリドリのメロディ", category: "ongekiAndChunithm" },
      { id: "o_25", title: "-OutsideR:RequieM-", category: "ongekiAndChunithm" },
      { id: "o_26", title: "あねぺったん", category: "ongekiAndChunithm" },
      { id: "o_27", title: "なるとなぎのパーフェクトロックンロール教室", category: "ongekiAndChunithm" },
      { id: "o_28", title: "Help me, あーりん！", category: "ongekiAndChunithm" },
      { id: "o_29", title: "Infantoon Fantasy", category: "ongekiAndChunithm" },
      { id: "o_30", title: "幾四音-Ixion-", category: "ongekiAndChunithm" },
      { id: "o_31", title: "Invitation", category: "ongekiAndChunithm" },
      { id: "o_32", title: "その群青が愛しかったようだった", category: "ongekiAndChunithm" },
      { id: "o_33", title: "The wheel to the right", category: "ongekiAndChunithm" },
      { id: "o_34", title: "光線チューニング", category: "ongekiAndChunithm" },
      { id: "o_35", title: "心象蜃気楼", category: "ongekiAndChunithm" },
      { id: "o_36", title: "エンドマークに希望と涙を添えて", category: "ongekiAndChunithm" },
      { id: "o_37", title: "World Vanquisher", category: "ongekiAndChunithm" },
      { id: "o_38", title: "Xevel", category: "ongekiAndChunithm" },
      { id: "o_39", title: "We Gonna Journey", category: "ongekiAndChunithm" },
      { id: "o_40", title: "My First Phone", category: "ongekiAndChunithm" },
      { id: "o_41", title: "怒槌", category: "ongekiAndChunithm" },
      { id: "o_42", title: "TiamaT:F minor", category: "ongekiAndChunithm" },
      { id: "o_43", title: "Kattobi KEIKYU Rider", category: "ongekiAndChunithm" },
      { id: "o_44", title: "玩具狂奏曲 -終焉-", category: "ongekiAndChunithm" },
      { id: "o_45", title: "BOKUTO", category: "ongekiAndChunithm" },
      { id: "o_46", title: "立川浄穢捕物帳", category: "ongekiAndChunithm" },
      { id: "o_47", title: "最強 the サマータイム!!!!!", category: "ongekiAndChunithm" },
      { id: "o_48", title: "UTAKATA", category: "ongekiAndChunithm" },
      { id: "o_49", title: "タテマエと本心の大乱闘", category: "ongekiAndChunithm" },
      { id: "o_50", title: "CHOCOLATE BOMB!!!!", category: "ongekiAndChunithm" },
      
      // Pop & Anime songs (78 songs)
      { id: "a_1", title: "HOT LIMIT", category: "popAndAnime" },
      { id: "a_2", title: "ネ！コ！", category: "popAndAnime" },
      { id: "a_3", title: "真・ハンサム体操でズンドコホイ", category: "popAndAnime" },
      { id: "a_4", title: "GET!! 夢&DREAM", category: "popAndAnime" },
      { id: "a_5", title: "バラライカ", category: "popAndAnime" },
      { id: "a_6", title: "若い力 -SEGA HARD GIRLS MIX-", category: "popAndAnime" },
      { id: "a_7", title: "セハガガガンバッちゃう！！", category: "popAndAnime" },
      { id: "a_8", title: "ラブリー☆えんじぇる!!", category: "popAndAnime" },
      { id: "a_9", title: "ラブって♡ジュエリー♪えんじぇる☆ブレイク！！", category: "popAndAnime" },
      { id: "a_10", title: "デビル☆アイドル", category: "popAndAnime" },
      { id: "a_11", title: "きらっせ☆ウッド村ファーム", category: "popAndAnime" },
      { id: "a_12", title: "にじよめちゃん体操第一億", category: "popAndAnime" },
      { id: "a_13", title: "Rodeo Machine", category: "popAndAnime" },
      { id: "a_14", title: "true my heart -Lovable mix-", category: "popAndAnime" },
      { id: "a_15", title: "POP STAR", category: "popAndAnime" },
      { id: "a_16", title: "Love or Lies", category: "popAndAnime" },
      { id: "a_17", title: "jelly", category: "popAndAnime" },
      { id: "a_18", title: "美しく燃える森", category: "popAndAnime" },
      { id: "a_19", title: "Love You", category: "popAndAnime" },
      { id: "a_20", title: "come again", category: "popAndAnime" },
      { id: "a_21", title: "Future", category: "popAndAnime" },
      { id: "a_22", title: "ウッーウッーウマウマ(ﾟ∀ﾟ)", category: "popAndAnime" },
      { id: "a_23", title: "NIGHT OF FIRE", category: "popAndAnime" },
      { id: "a_24", title: "YATTA!", category: "popAndAnime" },
      { id: "a_25", title: "fake!fake!", category: "popAndAnime" },
      { id: "a_26", title: "HIMITSUスパーク", category: "popAndAnime" },
      { id: "a_27", title: "ジンギスカン", category: "popAndAnime" },
      { id: "a_28", title: "ポップミュージックは僕のもの", category: "popAndAnime" },
      { id: "a_29", title: "日本の米は世界一", category: "popAndAnime" },
      { id: "a_30", title: "REVIVER オルタンシア・サーガ -蒼の騎士団- オリジナルVer.", category: "popAndAnime" },
      { id: "a_31", title: "前前前世", category: "popAndAnime" },
      { id: "a_32", title: "だから僕は音楽を辞めた", category: "popAndAnime" },
      { id: "a_33", title: "ハム太郎とっとこうた", category: "popAndAnime" },
      { id: "a_34", title: "ウマイネームイズうまみちゃん", category: "popAndAnime" },
      { id: "a_35", title: "Virtual to LIVE", category: "popAndAnime" },
      { id: "a_36", title: "タケモトピアノCMソング", category: "popAndAnime" },
      { id: "a_37", title: "うっせぇわ", category: "popAndAnime" },
      { id: "a_38", title: "夜に駆ける", category: "popAndAnime" },
      { id: "a_39", title: "廻廻奇譚", category: "popAndAnime" },
      { id: "a_40", title: "Shooting Stars", category: "popAndAnime" },
      
      // Touhou songs (sample - showing key popular ones)
      { id: "t_1", title: "ソリッド", category: "touhou" },
      { id: "t_2", title: "Bad Apple!! feat.nomico (REDALiCE Remix)", category: "touhou" },
      { id: "t_3", title: "Bad Apple!! feat nomico", category: "touhou" },
      { id: "t_27", title: "チルノのパーフェクトさんすう教室　⑨周年バージョン", category: "touhou" },
      { id: "t_28", title: "チルノのパーフェクトさんすう教室", category: "touhou" },
      { id: "t_29", title: "患部で止まってすぐ溶ける～狂気の優曇華院", category: "touhou" },
      { id: "t_31", title: "お嫁にしなさいっ！", category: "touhou" },
      { id: "t_77", title: "ウサテイ", category: "touhou" },
      { id: "t_81", title: "ナイト・オブ・ナイツ", category: "touhou" },
      { id: "t_84", title: "最終鬼畜妹フランドール・S", category: "touhou" },
      { id: "t_90", title: "魔理沙は大変なものを盗んでいきました", category: "touhou" },
      
      // Niconico & Vocaloid songs (sample)
      { id: "n_1", title: "アンドロイドガール", category: "niconicoAndVocaloid" },
      { id: "n_2", title: "スロウダウナー", category: "niconicoAndVocaloid" },
      { id: "n_3", title: "ビターチョコデコレーション", category: "niconicoAndVocaloid" },
      { id: "n_4", title: "スターリースカイ☆パレード", category: "niconicoAndVocaloid" },
      { id: "n_5", title: "だれかの心臓になれたなら", category: "niconicoAndVocaloid" },
      { id: "n_6", title: "グリーンライツ・セレナーデ", category: "niconicoAndVocaloid" },
      { id: "n_7", title: "METEOR", category: "niconicoAndVocaloid" },
      { id: "n_8", title: "だからパンを焼いたんだ", category: "niconicoAndVocaloid" },
      { id: "n_9", title: "太陽系デスコ", category: "niconicoAndVocaloid" },
      { id: "n_10", title: "彗星ハネムーン", category: "niconicoAndVocaloid" },
      
      // Game & Variety songs (sample)
      { id: "g_1", title: "BATTLE NO.1", category: "gameAndVariety" },
      { id: "g_2", title: "Black Lair", category: "gameAndVariety" },
      { id: "g_3", title: "FLOWER", category: "gameAndVariety" },
      { id: "g_4", title: "Scars of FAUNA", category: "gameAndVariety" },
      { id: "g_5", title: "極圏", category: "gameAndVariety" },
      { id: "g_6", title: "きたさいたま2000", category: "gameAndVariety" },
      { id: "g_7", title: "Ignis Danse", category: "gameAndVariety" },
      { id: "g_8", title: "夜明けまであと３秒", category: "gameAndVariety" },
      { id: "g_9", title: "セイクリッド　ルイン", category: "gameAndVariety" },
      { id: "g_10", title: "Got more raves？", category: "gameAndVariety" },
      
      // Maimai songs (sample)
      { id: "m_1", title: "Link", category: "maimai" },
      { id: "m_2", title: "ヤミツキ", category: "maimai" },
      { id: "m_3", title: "Secret Sleuth", category: "maimai" },
      { id: "m_4", title: "BLACK ROSE", category: "maimai" },
      { id: "m_5", title: "言ノ葉カルマ", category: "maimai" },
      { id: "m_6", title: "悪戯", category: "maimai" },
      { id: "m_7", title: "言ノ葉遊戯", category: "maimai" },
      { id: "m_8", title: "りばーぶ", category: "maimai" },
      { id: "m_9", title: "洗脳", category: "maimai" },
      { id: "m_10", title: "Barbed Eye", category: "maimai" }
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
      return allSongs.filter(song => song.category === selectedSongGenre.value)
    })

    // Watch for changes in selectedSongs to update the form
    watch(selectedSongs, (newSongs) => {
      newPost.value.songIdsString = newSongs.join(', ')
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
</style> 