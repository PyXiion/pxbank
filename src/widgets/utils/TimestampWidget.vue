<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from "vue";

interface Props {
  timestamp: number; /* in seconds */
  updateDelay?: number;
}

const props = defineProps<Props>();

const string = ref("");

function getString() {
  const now = Math.floor(Date.now() / 1000);
  const dt = Math.floor(now - props.timestamp);

  if (dt < 5) return "только что";
  if (dt < 60) return `${dt} с. назад`;
  if (dt < 60 * 60) return `${Math.floor(dt / 60)} мин. назад`;
  if (dt < 60 * 60 * 24) return `${Math.floor(dt / 60 / 60)} ч. назад`;

  return new Date(props.timestamp * 1000).toLocaleString();
}

function updateString() {
  string.value = getString();
}

onMounted(() => {
  updateString();
  if (props.updateDelay && props.updateDelay > 0) {
    setInterval(updateString, props.updateDelay);
  }
});

// Автоматически обновлять строку, если timestamp изменится (например, если компонент переиспользуется)
watchEffect(updateString);
</script>

<template>
  <div class="timestamp">
    {{ string }}
  </div>
</template>

<style scoped></style>
