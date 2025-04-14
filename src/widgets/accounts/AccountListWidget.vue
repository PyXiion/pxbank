<script setup lang="ts">

import Account from "@/widgets/accounts/AccountWidget.vue";
import {type AccountState, useAccountStore} from "@/stores/accountStore.ts";
import {computed, onActivated, onMounted, ref} from "vue";
import NewAccountButton from "@/widgets/operations/NewAccountButton.vue";

interface Props {
  username: string
}
const props = defineProps<Props>()

const accountStore = useAccountStore()

const state = computed(() => accountStore.users[props.username])

onMounted(() => {
  if (!accountStore.hasUser(props.username)) {
    accountStore.fetchUser(props.username)
  }
})

const errorText = computed(() => {
  if (state.value && state.value.error instanceof Error) {
    return state.value.error.message
  }

  return state.value?.error?.toString()
})


</script>

<template>
  <div v-if="!state || state.isLoading">
    Загрузка <i class="pi pi-spin pi-settings"></i>
  </div>
  <div v-else-if="state.error" class="panel text-red-500!">
    Ошибка. {{errorText}}
  </div>
  <div v-else class="flex flex-col gap-3">
    <TransitionGroup name="slide-transition">
      <Account
          v-for="acc in state.accounts"
          class="panel"
          :data="acc"
          :key="acc.id"
      />
    </TransitionGroup>

    <div class="panel flex flex-col text-center gap-2">
      <div v-if="state.accounts.length === 0">
        <p>Ой-ой, у вас, похоже, нет счёта.</p>
        <p>Хотите открыть?</p>
      </div>

      <NewAccountButton :username="username" class="mx-auto">Открыть</NewAccountButton>

    </div>
  </div>


</template>

<style scoped>
</style>