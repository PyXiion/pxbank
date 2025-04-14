<script setup lang="ts">
import {ref} from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import {Select} from 'primevue'
import Button from 'primevue/button'
import {useAccountStore} from "@/stores/accountStore.ts";
import {useToaster} from "@/utils/toaster.ts";

interface Props {
  username: string
}
const props = defineProps<Props>()

const accountStore = useAccountStore()
const toast = useToaster()

const visible = ref(false)

const accountName = ref(`Личный счёт`)
const options = ref([
  {
    name: 'Алмазы',
    code: 1
  }
])
const currency = ref(options.value[0])

async function click() {
  visible.value = false;

  try {
    await accountStore.create(props.username, accountName.value, currency.value.code)
  } catch (e: any) {
    toast.error('Не удалось создать счёт', e.message ?? e?.toString())
  }
}

</script>

<template>
  <Button @click="visible = true" v-bind="$attrs">Открыть счёт</Button>

  <Dialog
      modal
      header="Новый счёт"
      v-model:visible="visible"
      :style="{ width: '25rem' }"
  >
    <span class="block mb-3 text-surface-500 dark:text-surface-400">Введите информацию о счёте</span>

    <div class="flex items-center mb-4">
      <label for="username" class="inline-block w-24">Название</label>
      <InputText
          name="username"
          v-model="accountName"
          class="flex-auto"
      />
    </div>

    <div class="flex items-center mb-8">
      <label for="currency" class="inline-block w-24">Валюта</label>
      <Select
          v-model="currency"
          name="currency"
          :options="options"
          optionLabel="name"
          class="flex-auto"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button severity="secondary" @click="visible = false">Отмена</Button>
      <Button @click="click">Создать</Button>
    </div>
  </Dialog>
</template>
