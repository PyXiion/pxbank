<script setup lang="ts">
import CurrencyIcon from "@/widgets/utils/CurrencyIcon.vue";
import {computed} from "vue";

interface Props {
  amount: number|string

  iconPos: 'hide' | 'left' | 'right'
  currencyId?: number
  currencyIconSize?: string
}
const props = withDefaults(defineProps<Props>(), {
  iconPos: 'hide'
})

const balance = computed(() => typeof(props.amount) === 'string' ? parseFloat(props.amount) : props.amount)

</script>

<template>
  <div class="font-[Minecraft] flex">
    <CurrencyIcon v-if="iconPos === 'left' && currencyId" :currency-id="currencyId!" :size="currencyIconSize ?? 32"/>

    <div class="ml-1 flex place-items-end">
      <span class="height">{{Math.trunc(balance)}}</span>
      <span class="smaller opacity-50">.{{(balance * 100 % 100).toString().padStart(2, "0")}}</span>
    </div>

    <CurrencyIcon v-if="iconPos === 'right' && currencyId" :currency-id="currencyId!" :size="currencyIconSize ?? 32"/>

  </div>
</template>

<style scoped>
.smaller {
  transform: scale(0.8)  translateX(-13%) translateY(10%);
}
</style>