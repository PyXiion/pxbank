<script lang="ts" setup>
import {computed, onMounted, ref, watch} from "vue";
import AccountMiniInfo from "@/widgets/accounts/AccountMiniInfo.vue";
import type { Account } from "@/types.ts";
import {API} from "@/api/search.ts";

interface Props {
  ownerType: 'org' | 'user'
  ownerId: string | number,
  required_currency?: number
  exclude_id?: number
  placeholder?: string
}

const model = defineModel<Account | null>()
const props = defineProps<Props>()

const accounts = ref<Account[]>([])
const isLoading = ref(false)
const error = ref<Error | null>(null)

const filteredAccounts = computed(() => {
  if (!accounts.value) return []

  let result = [...accounts.value]

  if (props.required_currency) {
    result = result.filter(x =>
      x.currency_id == props.required_currency &&
      x.id != props.exclude_id
    )
  }

  return result
})

const placeholder = computed(() =>
  isLoading.value ? 'Загрузка...' : (props.placeholder ?? 'Выберите счёт')
)

onMounted(() => {
  reload()
})

async function reload() {
  model.value = null;
  if (!props.ownerId || !props.ownerType)
    return
  try {
    isLoading.value = true
    const response = await API.getAccounts(props.ownerType, props.ownerId)
    accounts.value = Array.isArray(response) ? response : []

    if (filteredAccounts.value) {
      model.value = filteredAccounts.value[0]
    }
  } catch (e) {
    accounts.value = []
  } finally {
    isLoading.value = false
  }
}

watch(() => [props.ownerType, props.ownerId], reload)

</script>

<template>
  <Select
    v-model="model"
    :loading="isLoading"
    :options="filteredAccounts"
    :placeholder="placeholder"
    :disabled="filteredAccounts.length == 0"
    empty-message="Нет доступных счетов"
    option-label="name"
  >
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