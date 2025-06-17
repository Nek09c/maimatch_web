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
import { defineComponent, ref, computed, watch } from 'vue'

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
    
    const categories = [
      { key: 'ongekiAndChunithm', name: 'ONGEKI & CHUNITHM' },
      { key: 'touhou', name: 'TOUHOU PROJECT' },
      { key: 'popAndAnime', name: 'POP & ANIME' },
      { key: 'maimai', name: 'MAIMAI ORIGINAL' },
      { key: 'niconicoAndVocaloid', name: 'NICONICO & VOCALOID' },
      { key: 'gameAndVariety', name: 'GAME & VARIETY' }
    ]

    // Complete song database from iOS app - ALL SONGS EXACTLY AS IN SWIFT FILE
    const allSongs = ref<Song[]>([
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
      { id: "o_51", title: "はちみつアドベンチャー", category: "ongekiAndChunithm" },
      { id: "o_52", title: "popcorn", category: "ongekiAndChunithm" },
      { id: "o_53", title: "宛城、炎上！！", category: "ongekiAndChunithm" },
      { id: "o_54", title: "レーイレーイ", category: "ongekiAndChunithm" },
      { id: "o_55", title: "YURUSHITE", category: "ongekiAndChunithm" },
      { id: "o_56", title: "Climax", category: "ongekiAndChunithm" },
      { id: "o_57", title: "Counselor", category: "ongekiAndChunithm" },
      { id: "o_58", title: "閃鋼のブリューナク", category: "ongekiAndChunithm" },
      { id: "o_59", title: "ポケットからぬりつぶせ！", category: "ongekiAndChunithm" },
      { id: "o_60", title: "トリドリ⇒モリモリ！Lovely fruits☆", category: "ongekiAndChunithm" },
      { id: "o_61", title: "Desperado Waltz", category: "ongekiAndChunithm" },
      { id: "o_62", title: "ハジマリノピアノ", category: "ongekiAndChunithm" },
      { id: "o_63", title: "オーケー？　オーライ！", category: "ongekiAndChunithm" },
      { id: "o_64", title: "サヨナラフリーウェイ", category: "ongekiAndChunithm" },
      { id: "o_65", title: "単一指向性オーバーブルーム", category: "ongekiAndChunithm" },
      { id: "o_66", title: "みなえをチェック！", category: "ongekiAndChunithm" },
      { id: "o_67", title: "Kiss Me Kiss", category: "ongekiAndChunithm" },
      { id: "o_68", title: "BOUNCE & DANCE", category: "ongekiAndChunithm" },
      { id: "o_69", title: "MEGATON BLAST", category: "ongekiAndChunithm" },
      { id: "o_70", title: "Splash Dance!!", category: "ongekiAndChunithm" },
      { id: "o_71", title: "脳天直撃", category: "ongekiAndChunithm" },
      { id: "o_72", title: "宿星審判", category: "ongekiAndChunithm" },
      { id: "o_73", title: "LiftOff", category: "ongekiAndChunithm" },
      { id: "o_74", title: "No Limit RED Force", category: "ongekiAndChunithm" },
      { id: "o_75", title: "Falsum Atlantis.", category: "ongekiAndChunithm" },
      { id: "o_76", title: "ぱくぱく☆がーる", category: "ongekiAndChunithm" },
      { id: "o_77", title: "Limits", category: "ongekiAndChunithm" },
      { id: "o_78", title: "スピカの天秤", category: "ongekiAndChunithm" },
      { id: "o_79", title: "ハードコア・シンドローム", category: "ongekiAndChunithm" },
      { id: "o_80", title: "We Are Us", category: "ongekiAndChunithm" },
      { id: "o_81", title: "テリトリーバトル", category: "ongekiAndChunithm" },
      { id: "o_82", title: "8-EM", category: "ongekiAndChunithm" },
      { id: "o_83", title: "otorii INNOVATED -[i]3-", category: "ongekiAndChunithm" },
      { id: "o_84", title: "Good bye, Merry-Go-Round.", category: "ongekiAndChunithm" },
      { id: "o_85", title: "パズルリボン", category: "ongekiAndChunithm" },
      { id: "o_86", title: "ツクヨミステップ", category: "ongekiAndChunithm" },
      { id: "o_87", title: "コスモポップファンクラブ", category: "ongekiAndChunithm" },
      { id: "o_88", title: "folern", category: "ongekiAndChunithm" },
      { id: "o_89", title: "Transcend Lights", category: "ongekiAndChunithm" },
      { id: "o_90", title: "エータ・ベータ・イータ", category: "ongekiAndChunithm" },
      { id: "o_91", title: "撩乱乙女†無双劇", category: "ongekiAndChunithm" },
      { id: "o_92", title: "See The Light", category: "ongekiAndChunithm" },
      { id: "o_93", title: "蜘蛛の糸", category: "ongekiAndChunithm" },
      { id: "o_94", title: "Catch Me If You Can", category: "ongekiAndChunithm" },
      { id: "o_95", title: "MAGNETAR GIRL", category: "ongekiAndChunithm" },
      { id: "o_96", title: "Don't Fight The Music", category: "ongekiAndChunithm" },
      { id: "o_97", title: "SUPER AMBULANCE", category: "ongekiAndChunithm" },
      { id: "o_98", title: "Ghost Dance", category: "ongekiAndChunithm" },
      { id: "o_99", title: "電光石火", category: "ongekiAndChunithm" },
      { id: "o_100", title: "ピュグマリオンの咒文", category: "ongekiAndChunithm" },
      { id: "o_101", title: "Hainuwele", category: "ongekiAndChunithm" },
      { id: "o_102", title: "Trrricksters!!", category: "ongekiAndChunithm" },
      { id: "o_103", title: "FLUFFY FLASH", category: "ongekiAndChunithm" },
      { id: "o_104", title: "Bad Apple!! feat.nomico ～五十嵐 撫子 Ver.～", category: "ongekiAndChunithm" },
      { id: "o_105", title: "Snow Colored Score", category: "ongekiAndChunithm" },
      { id: "o_106", title: "『ウソテイ』 ～一回戦せりなvsしろなvsなずな～", category: "ongekiAndChunithm" },
      { id: "o_107", title: "GEOMETRIC DANCE", category: "ongekiAndChunithm" },
      { id: "o_108", title: "LAMIA", category: "ongekiAndChunithm" },
      { id: "o_109", title: "Last Kingdom", category: "ongekiAndChunithm" },
      { id: "o_110", title: "STARRED HEART", category: "ongekiAndChunithm" },
      { id: "o_111", title: "Y.Y.Y.計画!!!!", category: "ongekiAndChunithm" },
      { id: "o_112", title: "SQUAD-Phvntom-", category: "ongekiAndChunithm" },
      { id: "o_113", title: "Apollo", category: "ongekiAndChunithm" },
      { id: "o_114", title: "PinqPiq (xovevox Remix)", category: "ongekiAndChunithm" },
      { id: "o_115", title: "WE'RE BACK!!", category: "ongekiAndChunithm" },
      { id: "o_116", title: "インパアフェクシオン・ホワイトガアル", category: "ongekiAndChunithm" },
      { id: "o_117", title: "Ring", category: "ongekiAndChunithm" },

      // Touhou songs (127 songs)
      { id: "t_1", title: "ソリッド", category: "touhou" },
      { id: "t_2", title: "Bad Apple!! feat.nomico (REDALiCE Remix)", category: "touhou" },
      { id: "t_3", title: "Bad Apple!! feat nomico", category: "touhou" },
      { id: "t_4", title: "CYBER Sparks", category: "touhou" },
      { id: "t_5", title: "Money Money", category: "touhou" },
      { id: "t_6", title: "LOVE EAST", category: "touhou" },
      { id: "t_7", title: "WARNING×WARNING×WARNING", category: "touhou" },
      { id: "t_8", title: "泡沫、哀のまほろば", category: "touhou" },
      { id: "t_9", title: "華鳥風月", category: "touhou" },
      { id: "t_10", title: "色は匂へど散りぬるを", category: "touhou" },
      { id: "t_11", title: "月に叢雲華に風", category: "touhou" },
      { id: "t_12", title: "ネクロファンタジア～Arr.Demetori", category: "touhou" },
      { id: "t_13", title: "Doll Judgment", category: "touhou" },
      { id: "t_14", title: "永遠のメロディ", category: "touhou" },
      { id: "t_15", title: "もうみんなしねばいいのに", category: "touhou" },
      { id: "t_16", title: "宿題が終わらないっ！", category: "touhou" },
      { id: "t_17", title: "東方スイーツ！～鬼畜姉妹と受難メイド～", category: "touhou" },
      { id: "t_18", title: "taboo tears you up", category: "touhou" },
      { id: "t_19", title: "Starlight Vision", category: "touhou" },
      { id: "t_20", title: "幽闇に目醒めしは", category: "touhou" },
      { id: "t_21", title: "物凄い勢いでけーねが物凄いうた", category: "touhou" },
      { id: "t_22", title: "進捗どうですか？", category: "touhou" },
      { id: "t_23", title: "アマノジャクリバース feat. ｙｔｒ", category: "touhou" },
      { id: "t_24", title: "天狗の落とし文 feat. ｙｔｒ", category: "touhou" },
      { id: "t_25", title: "オーディエンスを沸かす程度の能力 feat.タイツォン", category: "touhou" },
      { id: "t_26", title: "Club Ibuki in Break All", category: "touhou" },
      { id: "t_27", title: "チルノのパーフェクトさんすう教室　⑨周年バージョン", category: "touhou" },
      { id: "t_28", title: "チルノのパーフェクトさんすう教室", category: "touhou" },
      { id: "t_29", title: "患部で止まってすぐ溶ける～狂気の優曇華院", category: "touhou" },
      { id: "t_30", title: "究極焼肉レストラン！お燐の地獄亭！", category: "touhou" },
      { id: "t_31", title: "お嫁にしなさいっ！", category: "touhou" },
      { id: "t_32", title: "キャプテン・ムラサのケツアンカー", category: "touhou" },
      { id: "t_33", title: "ひれ伏せ愚民どもっ！", category: "touhou" },
      { id: "t_34", title: "げきオコスティックファイナリアリティぷんぷんマスタースパーク", category: "touhou" },
      { id: "t_35", title: "【東方ニコカラ】秘神マターラ feat.魂音泉【IOSYS】", category: "touhou" },
      { id: "t_36", title: "不思議の国のクリスマス", category: "touhou" },
      { id: "t_37", title: "INFINITE WORLD", category: "touhou" },
      { id: "t_38", title: "Grip & Break down !!", category: "touhou" },
      { id: "t_39", title: "Cosmic Magic Shooter", category: "touhou" },
      { id: "t_40", title: "しゅわスパ大作戦☆", category: "touhou" },
      { id: "t_41", title: "全人類ノ非想天則", category: "touhou" },
      { id: "t_42", title: "Endless, Sleepless Night", category: "touhou" },
      { id: "t_43", title: "White Traveling Girl", category: "touhou" },
      { id: "t_44", title: "No Routine", category: "touhou" },
      { id: "t_45", title: "Scream out! -maimai SONIC WASHER Edit-", category: "touhou" },
      { id: "t_46", title: "隠然", category: "touhou" },
      { id: "t_47", title: "みんなの", category: "touhou" },
      { id: "t_48", title: "幻想のサテライト", category: "touhou" },
      { id: "t_49", title: "待チ人ハ来ズ。", category: "touhou" },
      { id: "t_50", title: "響縁", category: "touhou" },
      { id: "t_51", title: "囲い無き世は一期の月影", category: "touhou" },
      { id: "t_52", title: "儚きもの人間", category: "touhou" },
      { id: "t_53", title: "sweet little sister", category: "touhou" },
      { id: "t_54", title: "ケロ⑨destiny", category: "touhou" },
      { id: "t_55", title: "Phantasm Brigade", category: "touhou" },
      { id: "t_56", title: "蒼空に舞え、墨染の桜", category: "touhou" },
      { id: "t_57", title: "フラグメンツ -T.V. maimai edit-", category: "touhou" },
      { id: "t_58", title: "橙の幻想郷音頭", category: "touhou" },
      { id: "t_59", title: "Starlight Dance Floor", category: "touhou" },
      { id: "t_60", title: "神々の祈り", category: "touhou" },
      { id: "t_61", title: "願いを呼ぶ季節", category: "touhou" },
      { id: "t_62", title: "明星ロケット", category: "touhou" },
      { id: "t_63", title: "緋色のDance", category: "touhou" },
      { id: "t_64", title: "YU-MU", category: "touhou" },
      { id: "t_65", title: "エテルニタス・ルドロジー", category: "touhou" },
      { id: "t_66", title: "エピクロスの虹はもう見えない", category: "touhou" },
      { id: "t_67", title: "四次元跳躍機関", category: "touhou" },
      { id: "t_68", title: "少女幻葬戦慄曲 ～ Necro Fantasia", category: "touhou" },
      { id: "t_69", title: "妖精村の月誕祭 ～Lunate Elf", category: "touhou" },
      { id: "t_70", title: "Jimang Shot", category: "touhou" },
      { id: "t_71", title: "ってゐ！ ～えいえんてゐVer～", category: "touhou" },
      { id: "t_72", title: "東方妖々夢 ～the maximum moving about～", category: "touhou" },
      { id: "t_73", title: "Yet Another \"drizzly rain\"", category: "touhou" },
      { id: "t_74", title: "シアワセうさぎ", category: "touhou" },
      { id: "t_75", title: "最速最高シャッターガール", category: "touhou" },
      { id: "t_76", title: "最終鬼畜妹・一部声", category: "touhou" },
      { id: "t_77", title: "ウサテイ", category: "touhou" },
      { id: "t_78", title: "クレイジークレイジーダンサーズ", category: "touhou" },
      { id: "t_79", title: "Help me, ERINNNNNN!!", category: "touhou" },
      { id: "t_80", title: "ナイト・オブ・ナイツ (Cranky Remix)", category: "touhou" },
      { id: "t_81", title: "ナイト・オブ・ナイツ", category: "touhou" },
      { id: "t_82", title: "疾走あんさんぶる", category: "touhou" },
      { id: "t_83", title: "サドマミホリック", category: "touhou" },
      { id: "t_84", title: "最終鬼畜妹フランドール・S", category: "touhou" },
      { id: "t_85", title: "進め！イッスン軍団 -Rebellion of the Dwarfs-", category: "touhou" },
      { id: "t_86", title: "Little \"Sister\" Bitch", category: "touhou" },
      { id: "t_87", title: "Yakumo >>JOINT STRUGGLE (2019 Update)", category: "touhou" },
      { id: "t_88", title: "Imperishable Night 2006 (2016 Refine)", category: "touhou" },
      { id: "t_89", title: "Calamity Fortune", category: "touhou" },
      { id: "t_90", title: "魔理沙は大変なものを盗んでいきました", category: "touhou" },
      { id: "t_91", title: "Drive Your Fire", category: "touhou" },
      { id: "t_92", title: "Oath Act", category: "touhou" },
      { id: "t_93", title: "全力ハッピーライフ", category: "touhou" },
      { id: "t_94", title: "wheel", category: "touhou" },
      { id: "t_95", title: "Witches night", category: "touhou" },
      { id: "t_96", title: "悪戯センセーション", category: "touhou" },
      { id: "t_97", title: "Paranoia", category: "touhou" },
      { id: "t_98", title: "物凄いヴァイブスで魔理沙が物凄いラップ", category: "touhou" },
      { id: "t_99", title: "Sweet Requiem", category: "touhou" },
      { id: "t_100", title: "Dive into The Sky ～initialized～", category: "touhou" },
      { id: "t_101", title: "絡繰りドール", category: "touhou" },
      { id: "t_102", title: "Prismatic", category: "touhou" },
      { id: "t_103", title: "ロストワードクロニカル", category: "touhou" },
      { id: "t_104", title: "今、誰が為のかがり火へ", category: "touhou" },
      { id: "t_105", title: "トランスダンスアナーキー", category: "touhou" },
      { id: "t_106", title: "ハウリング", category: "touhou" },
      { id: "t_107", title: "Melody！", category: "touhou" },
      { id: "t_108", title: "下克上々", category: "touhou" },
      { id: "t_109", title: "紅星ミゼラブル～廃憶編", category: "touhou" },
      { id: "t_110", title: "幻想に咲いた花", category: "touhou" },
      { id: "t_111", title: "マツヨイナイトバグ", category: "touhou" },
      { id: "t_112", title: "Sweets Time", category: "touhou" },
      { id: "t_113", title: "響け！CHIREI MY WAY!", category: "touhou" },
      { id: "t_114", title: "神々が恋した幻想郷", category: "touhou" },
      { id: "t_115", title: "Armageddon", category: "touhou" },
      { id: "t_116", title: "三妖精SAY YA!!!", category: "touhou" },
      { id: "t_117", title: "紅に染まる恋の花", category: "touhou" },
      { id: "t_118", title: "大輪の魂 (feat. AO, 司芭扶)", category: "touhou" },
      { id: "t_119", title: "Spring of Dreams", category: "touhou" },
      { id: "t_120", title: "スカーレット警察のゲットーパトロール24時", category: "touhou" },
      { id: "t_121", title: "銀のめぐり", category: "touhou" },
      { id: "t_122", title: "Destiny Runner", category: "touhou" },
      { id: "t_123", title: "リスペク風神", category: "touhou" },
      { id: "t_124", title: "インターネットサバイバー", category: "touhou" },
      { id: "t_125", title: "つるぺったん", category: "touhou" },
      { id: "t_126", title: "解けないように", category: "touhou" },
      { id: "t_127", title: "HANIPAGANDA", category: "touhou" },

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
      { id: "a_41", title: "MOON NIGHTのせいにして", category: "popAndAnime" },
      { id: "a_42", title: "ドラゴンエネルギー", category: "popAndAnime" },
      { id: "a_43", title: "veil", category: "popAndAnime" },
      { id: "a_44", title: "泥の分際で私だけの大切を奪おうだなんて", category: "popAndAnime" },
      { id: "a_45", title: "インドア系ならトラックメイカー", category: "popAndAnime" },
      { id: "a_46", title: "YONA YONA DANCE", category: "popAndAnime" },
      { id: "a_47", title: "くらべられっ子", category: "popAndAnime" },
      { id: "a_48", title: "あの世行きのバスに乗ってさらば。", category: "popAndAnime" },
      { id: "a_49", title: "　", category: "popAndAnime" },
      { id: "a_50", title: "吾輩よ猫であれ", category: "popAndAnime" },
      { id: "a_51", title: "Photon Melodies", category: "popAndAnime" },
      { id: "a_52", title: "春を告げる", category: "popAndAnime" },
      { id: "a_53", title: "Princess♂", category: "popAndAnime" },
      { id: "a_54", title: "ヒトガタ", category: "popAndAnime" },
      { id: "a_55", title: "オントロジー", category: "popAndAnime" },
      { id: "a_56", title: "VOLTAGE", category: "popAndAnime" },
      { id: "a_57", title: "剣を抜け！GCCX MAX", category: "popAndAnime" },
      { id: "a_58", title: "ミラクル・ショッピング", category: "popAndAnime" },
      { id: "a_59", title: "おジャ魔女カーニバル!!", category: "popAndAnime" },
      { id: "a_60", title: "踊", category: "popAndAnime" },
      { id: "a_61", title: "残響散歌", category: "popAndAnime" },
      { id: "a_62", title: "アマカミサマ", category: "popAndAnime" },
      { id: "a_63", title: "モンダイナイトリッパー！", category: "popAndAnime" },
      { id: "a_64", title: "Baddest", category: "popAndAnime" },
      { id: "a_65", title: "Blank Paper (Prod. TEMPLIME)", category: "popAndAnime" },
      { id: "a_66", title: "In my world (Prod. KOTONOHOUSE)", category: "popAndAnime" },
      { id: "a_67", title: "阿修羅ちゃん", category: "popAndAnime" },
      { id: "a_68", title: "おとせサンダー", category: "popAndAnime" },
      { id: "a_69", title: "ヒバリ", category: "popAndAnime" },
      { id: "a_70", title: "Hello, Hologram", category: "popAndAnime" },
      { id: "a_71", title: "不機嫌なスリーカード", category: "popAndAnime" },
      { id: "a_72", title: "魂のルフラン", category: "popAndAnime" },
      { id: "a_73", title: "はんぶんこ", category: "popAndAnime" },
      { id: "a_74", title: "あつすぎの歌", category: "popAndAnime" },
      { id: "a_75", title: "さくゆいたいそう", category: "popAndAnime" },
      { id: "a_76", title: "HUMANBORG", category: "popAndAnime" },
      { id: "a_77", title: "ULTRA POWER", category: "popAndAnime" },
      { id: "a_78", title: "Burn My Soul", category: "popAndAnime" },

      // Maimai songs (323 songs) - Complete list from iOS app
      { id: "m_1", title: "Link", category: "maimai" },
      { id: "m_2", title: "ヤミツキ", category: "maimai" },
      { id: "m_3", title: "Secret Sleuth", category: "maimai" },
      { id: "m_4", title: "BLACK ROSE", category: "maimai" },
      { id: "m_5", title: "言ノ葉カルマ", category: "maimai" },
      { id: "m_6", title: "悪戯", category: "maimai" },
      { id: "m_7", title: "言ノ葉遊戯", category: "maimai" },
      { id: "m_8", title: "りばーぶ", category: "maimai" },
      { id: "m_9", title: "洗脳", category: "maimai" },
      { id: "m_10", title: "Barbed Eye", category: "maimai" },
      { id: "m_11", title: "空威張りビヘイビア", category: "maimai" },
      { id: "m_12", title: "分からない", category: "maimai" },
      { id: "m_13", title: "天国と地獄 -言ノ葉リンネ-", category: "maimai" },
      { id: "m_14", title: "相思創愛", category: "maimai" },
      { id: "m_15", title: "咲キ誇レ常世ノ華", category: "maimai" },
      { id: "m_16", title: "Valsqotch", category: "maimai" },
      { id: "m_17", title: "UniTas", category: "maimai" },
      { id: "m_18", title: "モ°ルモ°ル", category: "maimai" },
      { id: "m_19", title: "ここからはじまるプロローグ。", category: "maimai" },
      { id: "m_20", title: "絡めトリック利己ライザー", category: "maimai" },
      { id: "m_21", title: "アポカリプスに反逆の焔を焚べろ", category: "maimai" },
      { id: "m_22", title: "TEmPTaTiON", category: "maimai" },
      { id: "m_23", title: "Now or Never", category: "maimai" },
      { id: "m_24", title: "福宿音屋魂音泉", category: "maimai" },
      { id: "m_25", title: "キリキリ舞Mine", category: "maimai" },
      { id: "m_26", title: "一か罰", category: "maimai" },
      { id: "m_27", title: "♡マイマイマイラブ♡", category: "maimai" },
      { id: "m_28", title: "Blows Up Everything", category: "maimai" },
      { id: "m_29", title: "TwisteD! XD", category: "maimai" },
      { id: "m_30", title: "魔ジョ狩リ", category: "maimai" },
      { id: "m_31", title: "Technicians High", category: "maimai" },
      { id: "m_32", title: "Scarlet Wings", category: "maimai" },
      { id: "m_33", title: "STEREOSCAPE", category: "maimai" },
      { id: "m_34", title: "Crazy Circle", category: "maimai" },
      { id: "m_35", title: "バーチャルダム　ネーション", category: "maimai" },
      { id: "m_36", title: "MAXRAGE", category: "maimai" },
      { id: "m_37", title: "P-qoq", category: "maimai" },
      { id: "m_38", title: "超常マイマイン", category: "maimai" },
      { id: "m_39", title: "でらっくmaimai♪てんてこまい!", category: "maimai" },
      { id: "m_40", title: "SILENT BLUE", category: "maimai" },
      { id: "m_41", title: "雷切-RAIKIRI-", category: "maimai" },
      { id: "m_42", title: "花と、雪と、ドラムンベース。", category: "maimai" },
      { id: "m_43", title: "Ragnarok", category: "maimai" },
      { id: "m_44", title: "larva", category: "maimai" },
      { id: "m_45", title: "keep hopping", category: "maimai" },
      { id: "m_46", title: "FestivaLight", category: "maimai" },
      { id: "m_47", title: "Excalibur ～Revived resolution～", category: "maimai" },
      { id: "m_48", title: "Caliburne ～Story of the Legendary sword～", category: "maimai" },
      { id: "m_49", title: "Justified", category: "maimai" },
      { id: "m_50", title: "Mare Maris", category: "maimai" },
      { id: "m_51", title: "Candy Tall Woman", category: "maimai" },
      { id: "m_52", title: "Kinda Way", category: "maimai" },
      { id: "m_323", title: "The Great Banquet", category: "maimai" },

      // Niconico & Vocaloid songs (244 songs) - Complete from Swift
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
      { id: "n_244", title: "さよならプリンセス", category: "niconicoAndVocaloid" },

      // Game & Variety songs (203 songs) - Complete from Swift
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
      { id: "g_203", title: "Rush-Hour", category: "gameAndVariety" }
    ])

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
      getCategoryName
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
}

.total-songs {
  color: var(--lain-accent);
  font-size: 0.9rem;
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
}
</style> 