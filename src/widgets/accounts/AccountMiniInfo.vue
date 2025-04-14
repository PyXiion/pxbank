<script setup lang="ts">
import type {Account} from "@/types.ts";
import BalanceWidget from "@/widgets/accounts/MoneyWidget.vue";
import {computed} from "vue";

interface Props {
  data: Account
  showBalance?: boolean
}
const props = defineProps<Props>()
const accountDisplayName = computed(() => !!props.data.name.trim() ? props.data.name.trim() : 'Безымянный счёт')
</script>

<template>
  <div class="flex">
    <p class="mr-2">{{accountDisplayName}}</p>

    <div class="ml-auto" v-if="showBalance">
      <BalanceWidget class="text-[16px]/[16px]" :amount="data.balance" :currency-id="data.currency_id" currency-icon-size="24px" icon-pos="left"/>
    </div>
  </div>
</template>

<style scoped>
</style>