<script setup lang="ts">
import CurrencyIcon from "@/widgets/utils/CurrencyIcon.vue";
import {computed, ref, watch} from "vue";
import {animate} from "animejs";

interface Props {
  amount: number|string

  iconPos: 'hide' | 'left' | 'right'
  currencyId?: number
  currencyIconSize?: string
}
const props = withDefaults(defineProps<Props>(), {
  iconPos: 'hide'
})

const currentBalance = ref(typeof(props.amount) === 'string' ? parseFloat(props.amount) : props.amount)

const displayBalance = computed(() => {
  let x = currentBalance.value
  let suffix = ''
  while (x > 990) {
    x /= 1000
    suffix += 'К'
  }

  const [main, kopeiki] = x.toFixed(2).split('.')

  return {
    main,
    kopeiki,
    suffix: suffix
  }
})

watch(() => props.amount, () => {
  animate(currentBalance, {
    value: props.amount
  })
})

</script>

<template>
  <div class="font-[Minecraft] flex cursor-default">
    <CurrencyIcon v-if="iconPos === 'left' && currencyId" :currency-id="currencyId!" :size="currencyIconSize ?? 32"/>

    <div
      v-tooltip="{
        value: currentBalance.toFixed(2),
        showDelay: 500,
        hideDelay: 300
      }"
      class="ml-1 flex place-items-end"
    >
      <span class="height">{{displayBalance.main}}</span>
      <span class="smaller opacity-50">.{{displayBalance.kopeiki}}</span>
      <span class="smaller">{{ displayBalance.suffix }}</span>
    </div>

    <CurrencyIcon v-if="iconPos === 'right' && currencyId" :currency-id="currencyId!" :size="currencyIconSize ?? 32"/>

  </div>
</template>

<style scoped>
.smaller {
  transform: scale(0.8)  translateX(-13%) translateY(10%);
}
</style>