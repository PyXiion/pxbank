<script lang="ts" setup>
import {computed, onMounted} from "vue";
import {useAccountStore} from "@/stores/accountStore.ts";
import AccountMiniInfo from "@/widgets/accounts/AccountMiniInfo.vue";
import type {Account} from "@/types.ts";

interface Props {
  username_from: string,

  required_currency?: number
  exclude_id?: number

  placeholder?: string
}

const model = defineModel<Account | null>()

const props = defineProps<Props>()

const accountStore = useAccountStore()

const state = computed(() => accountStore.users[props.username_from] ?? null)

const accounts = computed(() => {
  if (!state.value)
    return []
  if (props.required_currency) {
    return state.value.accounts.filter(x => x.currency_id == props.required_currency && x.id != props.exclude_id)
  }
  return state.value.accounts
})

const isLoading = computed(() => !state.value || state.value.isLoading)
const placeholder = computed(() => isLoading.value ? 'Загрузка...' : (props.placeholder ?? 'Выберите счёт'))

onMounted(() => {
  if (!accountStore.hasUser(props.username_from)) {
    accountStore.fetchUser(props.username_from)
  }
})

</script>

<template>
  <Select v-model="model" :loading="isLoading" :options="accounts" :placeholder="placeholder"
          empty-message="Нет доступных счетов" option-label="name">

    <template #value="optionProps">
      <AccountMiniInfo v-if="optionProps.value" :data="optionProps.value" show-balance/>
      <span v-else>
        {{ optionProps.placeholder }}
      </span>
    </template>

    <template #option="optionProps">
      <AccountMiniInfo v-if="optionProps.option" :data="optionProps.option" class="w-1/1" show-balance/>
    </template>

  </Select>
</template>

<style scoped>

</style>