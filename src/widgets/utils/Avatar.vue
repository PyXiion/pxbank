<script setup lang="ts">
import { computed } from "vue";
import { cyrb53 } from "@/utils/hash.ts";

interface Props {
  name?: string;
  size?: number | string;
}

const props = defineProps<Props>();

const size = computed(() => typeof props.size === "number" ? `${props.size}px` : props.size ?? '24px');

const style = computed(() =>
    `width: ${size.value};
    height: ${size.value};
    font-size: calc(${size.value} * 3 / 4);
    line-height: ${size.value};`
);
</script>

<template>
  <img class="avatar" :src="`https://mc-heads.net/avatar/${name}.png` + (typeof(props.size) == 'number' ? props.size.toString() : 64)" alt="Avatar" :style="style">
</template>