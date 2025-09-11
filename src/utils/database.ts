interface Song {
  id: string;
  title: string;
  category: string;
}

interface DatabaseSong {
  songId: string;
  title: string;
  category: string;
}

// Map database categories to UI categories
const categoryMap: { [key: string]: string } = {
  maimai: "maimai",
  "POPS＆アニメ": "popAndAnime",
  "ゲーム＆バラエティ": "gameAndVariety",
  "niconico＆ボーカロイド": "niconicoAndVocaloid",
  "オンゲキ＆チュウニズム": "ongekiAndChunithm",
  東方Project: "touhou",
};

// Load songs from the exported JSON file
export async function getAllSongs(): Promise<Song[]> {
  try {
    const songsModule = await import("@/data/songs-from-db.json");
    return songsModule.default as Song[];
  } catch (error) {
    console.error("Error loading songs from database:", error);
    return getMockSongs();
  }
}

export async function getSongsByCategory(category: string): Promise<Song[]> {
  const allSongs = await getAllSongs();
  return allSongs.filter((song) => song.category === category);
}

export async function searchSongs(query: string): Promise<Song[]> {
  const allSongs = await getAllSongs();
  const lowerQuery = query.toLowerCase();
  return allSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(lowerQuery) ||
      song.id.toLowerCase().includes(lowerQuery)
  );
}

// Fallback mock data if JSON loading fails
function getMockSongs(): Song[] {
  return [
    { id: "Color My World", title: "Color My World", category: "maimai" },
    { id: "Future", title: "Future", category: "popAndAnime" },
    { id: "Love You", title: "Love You", category: "popAndAnime" },
    { id: "In Chaos", title: "In Chaos", category: "gameAndVariety" },
    { id: "Crush On You", title: "Crush On You", category: "gameAndVariety" },
    { id: "Sun Dance", title: "Sun Dance", category: "gameAndVariety" },
    { id: "Sweets×Sweets", title: "Sweets×Sweets", category: "maimai" },
    { id: "Love or Lies", title: "Love or Lies", category: "popAndAnime" },
    { id: "ネコ日和。", title: "ネコ日和。", category: "maimai" },
    { id: "虹と太陽", title: "虹と太陽", category: "maimai" },
  ];
}
