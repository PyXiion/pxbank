<script lang="ts" setup>

import {ref} from "vue";
import {API} from "@/api/search.ts";

const value = defineModel()
const loading = ref(false)

const suggestions = ref<string[]>([])

async function fetch($: any) {
  if (loading.value) return
  try {
    loading.value = true
    suggestions.value = await API.searchUsers($.query)
  } catch (e) {
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <AutoComplete
    v-model="value"
    :loading="loading"
    :suggestions="suggestions"
    empty-search-message="Игрок не найден"
    force-selection
    placeholder="Имя игрока"
    @complete="fetch"
  />
</template>

<style scoped>

</style>