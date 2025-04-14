<script setup lang="ts">

import {computed} from "vue";
import {useCurrencyStore} from "@/stores/currencyStore.ts";
import type {Currency} from "@/types.ts";

import defaultIcon from '@/assets/diamond.png'

interface Props {
  currencyId: number;
  size?: number | string;
}

const props = defineProps<Props>();

const currencyStore = useCurrencyStore()
const currency = computed<Currency|null>(() => currencyStore.getCurrencyIcon(props.currencyId))

const size = computed(() => typeof props.size === "number" ? `${props.size}px` : props.size ?? '24px');

const style = computed(() =>
    `width: ${size.value};
    height: ${size.value};`
);
</script>

<template>
  <div class="currency-icon" :style="style">
    <img :src="currency?.icon_url ?? defaultIcon" :alt="`Валюта ${currency?.name ?? 'без имени'}`">
  </div>
</template>

<style scoped>
.currency-icon {
  display: inline-block;
}
img {
  width: 100%;
  height: 100%;
}
</style>