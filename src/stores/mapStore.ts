import { defineStore } from "pinia";
import { reactive, ref, shallowReactive } from "vue";
import { animate } from "animejs";
import { useProtocol } from "@/stores/protocolStore.ts";

export const CHUNK_SIZE = 512;
export interface PlayerData {
  world: string;
  name: string;
  x: number;
  y: number;
  z: number;
  uuid: string;
  yaw: number;
}

function decodeBase64(base64: string): Uint8Array {
  const bin = atob(base64);
  const len = bin.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

export const useMapStore = defineStore("secretMap", () => {
  const pieces = shallowReactive(new Map<string, ImageBitmap>());
  const chunkAlphas = shallowReactive(new Map<string, { value: number }>());
  const players = ref<PlayerData[]>([]);
  const playerIcon = ref<ImageBitmap | null>(null);
  const { protocol } = useProtocol();

  // Concurrency control for chunk loading
  const loadQueue: { x: number; y: number; key: string }[] = [];
  let currentLoads = 0;
  const MAX_CONCURRENT = 7;

  async function processQueue() {
    while (currentLoads < MAX_CONCURRENT && loadQueue.length > 0) {
      const { x, y, key } = loadQueue.shift()!;
      if (pieces.has(key)) continue;
      currentLoads++;
      try {
        const resp: string = await protocol.send('map/chunk', { x, y });
        const blob = new Blob([decodeBase64(resp)], { type: 'image/png' });
        const img = await createImageBitmap(blob);
        pieces.set(key, img);
        const alpha = { value: 0 };
        chunkAlphas.set(key, alpha);
        animate(alpha, { value: [0, 1], duration: 1500 });
      } catch (e) {
        console.error('Error loading chunk', key, e);
      } finally {
        currentLoads--;
        // Continue processing
        processQueue();
      }
    }
  }

  /**
   * Предзагружает чанки с ограничением параллельных запросов
   */
  function preloadChunks(chunks: Iterable<{ x: number; y: number; key: string }>) {
    for (const { x, y, key } of chunks) {
      if (pieces.has(key) || loadQueue.find(q => q.key === key)) continue;
      loadQueue.push({ x, y, key });
    }
    processQueue();
  }

  /**
   * Удаляет ненужные чанки
   */
  function cleanupChunks(chunks: Iterable<{ x: number; y: number; key: string }>) {
    const visible = new Set<string>(Array.from(chunks, c => c.key));
    for (const key of Array.from(pieces.keys())) {
      if (!visible.has(key)) {
        pieces.delete(key);
        chunkAlphas.delete(key);
      }
    }
  }

  /**
   * Throttled fetch of player list remains unchanged
   */
  const lastPlayersFetch = ref(0);
  const PLAYER_TTL = 5000;
  async function fetchPlayers(): Promise<PlayerData[]> {
    const now = Date.now();
    if (now - lastPlayersFetch.value < PLAYER_TTL) return players.value;
    lastPlayersFetch.value = now;
    try {
      // const resp = await fetch('https://map.pivoland.ru/tiles/players.json');
      // const data = await resp.json();
      // players.value = data.players;
    } catch (e) {
      console.error('Failed to fetch players', e);
    }
    return players.value;
  }

  // Load player icon
  (async () => {
    try {
      // const resp = await fetch('https://map.pivoland.ru/images/icon/player.png');
      // const blob = await resp.blob();
      // playerIcon.value = await createImageBitmap(blob);
    } catch {
      playerIcon.value = null;
    }
  })();

  return {
    pieces,
    chunkAlphas,
    players,
    playerIcon,
    preloadChunks,
    cleanupChunks,
    fetchPlayers
  };
});
