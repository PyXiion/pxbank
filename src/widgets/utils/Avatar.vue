<script lang="ts" setup>
import {computed} from "vue";

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
  <img :src="`https://mc-heads.net/avatar/${name}/${typeof(props.size) == 'number' ? props.size.toString() : 64}.png`"
       :style="style"
       alt="Avatar" class="avatar">
</template>