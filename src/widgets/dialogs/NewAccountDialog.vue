<script lang="ts" setup>

import {inject, onMounted, ref, type Ref} from "vue";
import type {DynamicDialogInstance} from "primevue/dynamicdialogoptions";
import type {DialogProps} from "primevue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import {useAccountStore} from "@/stores/accountStore.ts";
import {useToaster} from "@/utils/toaster.ts";

const dialogRef = inject<Ref<DynamicDialogInstance>>('dialogRef')
const accountStore = useAccountStore()
const toast = useToaster()

const type = ref<'org' | 'user'>()
const target = ref<number | string>()

const defaultName = `Личный счёт`
const name = ref(defaultName)

const currencies = ref([
  {
    name: 'Алмазы',
    code: 1
  }
])
const currency = ref(currencies.value[0])

async function submit() {
  try {
    await accountStore.createAccount(type.value!, target.value!, name.value, currency.value.code)

    dialogRef?.value.close()
    toast.success('Счёт создан')
  } catch (e: any) {
    toast.error('Не удалось создать счёт', e.message ?? e?.toString())
  }
}

onMounted(() => {
  type.value = dialogRef!.value.data.type
  target.value = dialogRef!.value.data.target

  dialogRef!.value.options.props = Object.assign(dialogRef!.value.options.props ?? {}, {
    header: `Открыть счёт`,
    modal: true,
    style: {width: '25em'}
  } satisfies DialogProps)
})
</script>

<template>
  <div class="p-3 space-y-4">
    <span class="block mb-3 text-surface-500 dark:text-surface-400">Введите информацию о счёте</span>

    <FloatLabel variant="on">
      <InputText
        v-model="name"
        class="w-1/1"
        name="username"
      />
      <label class="inline-block" for="username">Название</label>
    </FloatLabel>

    <!--    <div class="flex items-center mb-8">-->
    <!--      <label for="currency" class="inline-block w-24">Валюта</label>-->
    <!--      <Select-->
    <!--          v-model="currency"-->
    <!--          name="currency"-->
    <!--          :options="options"-->
    <!--          optionLabel="name"-->
    <!--          class="flex-auto"-->
    <!--      />-->
    <!--    </div>-->

    <div class="flex justify-end gap-3">
      <Button severity="secondary" @click="dialogRef?.close()">Отмена</Button>
      <Button @click="submit">Создать</Button>
    </div>
  </div>
</template>

<style scoped>

</style>