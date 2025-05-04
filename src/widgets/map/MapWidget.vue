<script setup lang="ts">
import { CHUNK_SIZE, useMapStore } from "@/stores/mapStore.ts";
import { defineProps, onMounted, onBeforeUnmount, ref, computed, watch } from "vue";

interface Props { width: number; height: number; }
const props = defineProps<Props>();

const mapStore = useMapStore();
const canvas = ref<HTMLCanvasElement | null>(null);

// Viewport state
const offset = ref({ x: 0, y: 0 });
const scale = ref(2);
const MIN_SCALE = 2;
const MAX_SCALE = 12;
let dragStart: { x: number; y: number } | null = null;
let velocity = { x: 0, y: 0 };
let momentumId: number | null;
let drawId: number | null;

// Throttled player fetch
let playerTimer: number | null;
const PLAYER_INTERVAL = 5000;
function startPlayerLoop() {
  if (playerTimer) return;
  async function loop() {
    await mapStore.fetchPlayers();
    playerTimer = window.setTimeout(loop, PLAYER_INTERVAL);
  }
  loop();
}

// Compute visible chunks
const visibleChunks = computed(() => {
  const x0 = offset.value.x;
  const y0 = offset.value.y;
  const x1 = x0 + props.width / scale.value;
  const y1 = y0 + props.height / scale.value;
  const sx = Math.floor(x0 / CHUNK_SIZE) - 2;
  const sy = Math.floor(y0 / CHUNK_SIZE) - 2;
  const ex = Math.ceil(x1 / CHUNK_SIZE) + 2;
  const ey = Math.ceil(y1 / CHUNK_SIZE) + 2;
  const out: { x: number; y: number; key: string }[] = [];
  for (let x = sx; x < ex; x++) {
    for (let y = sy; y < ey; y++) {
      out.push({ x, y, key: `${x}_${y}` });
    }
  }
  return out;
});

// Watch visibleChunks to preload and cleanup
watch(visibleChunks, (chunks) => {
  mapStore.preloadChunks(chunks);
  mapStore.cleanupChunks(chunks);
});

// Draw loop
function draw() {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  // clear
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,props.width,props.height);
  // world transform
  ctx.setTransform(scale.value,0,0,scale.value,-offset.value.x*scale.value,-offset.value.y*scale.value);

  // draw chunks
  for (const { x, y, key } of visibleChunks.value) {
    const img = mapStore.pieces.get(key);
    if (img) {
      ctx.globalAlpha = mapStore.chunkAlphas.get(key)?.value ?? 1;
      ctx.drawImage(img, x*CHUNK_SIZE, y*CHUNK_SIZE);
    }
  }
  ctx.globalAlpha = 1;

  // draw players
  const icon = mapStore.playerIcon;
  if (icon) {
    for (const p of mapStore.players) {
      const sx = (p.x - offset.value.x) * scale.value;
      const sy = (p.z - offset.value.y) * scale.value;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(p.yaw);
      ctx.drawImage(icon, -icon.width/2, -icon.height/2);
      ctx.restore();
    }
  }

  drawId = requestAnimationFrame(draw);
}

function cancelDraw() {
  if (drawId) cancelAnimationFrame(drawId);
  drawId = null;
}

// Input
function onWheel(e: WheelEvent) {
  e.preventDefault();
  const rect = canvas.value!.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const worldX = (cx + offset.value.x*scale.value)/scale.value;
  const worldY = (cy + offset.value.y*scale.value)/scale.value;
  const factor = 1 - e.deltaY*0.001;
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value*factor));
  offset.value.x = worldX - cx/newScale;
  offset.value.y = worldY - cy/newScale;
  scale.value = newScale;
}
function onMouseDown(e: MouseEvent) {
  dragStart = { x: e.clientX, y: e.clientY };
  velocity = { x: 0, y: 0 };
  if (momentumId) cancelAnimationFrame(momentumId);
}
function onMouseMove(e: MouseEvent) {
  if (!dragStart) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  offset.value.x -= dx/scale.value;
  offset.value.y -= dy/scale.value;
  velocity = { x: dx/scale.value, y: dy/scale.value };
  dragStart = { x: e.clientX, y: e.clientY };
}
function onMouseUp() {
  dragStart = null;
  applyMomentum();
}
function applyMomentum() {
  const friction = 0.9;
  function step() {
    velocity.x *= friction;
    velocity.y *= friction;
    if (Math.hypot(velocity.x, velocity.y) < 0.02) return;
    offset.value.x -= velocity.x;
    offset.value.y -= velocity.y;
    momentumId = requestAnimationFrame(step);
  }
  step();
}

onMounted(() => {
  watch([offset, scale], () => draw(), { immediate: true });
  startPlayerLoop();
});
onBeforeUnmount(() => {
  cancelDraw();
  if (momentumId) cancelAnimationFrame(momentumId);
  if (playerTimer) clearTimeout(playerTimer);
});
</script>

<template>
  <canvas
    ref="canvas"
    :width="props.width"
    :height="props.height"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  />
</template>

<style scoped>
canvas { display: block; user-select: none; cursor: grab; }
canvas:active { cursor: grabbing; }
</style>