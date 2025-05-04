<script setup lang="ts">

import {useOrganizationListStore, useOrganizationStore} from "@/stores/organizationStore.ts";
import {inject, onMounted, type Ref, ref} from "vue";
import type {DialogProps} from "primevue";
import type {DynamicDialogInstance} from "primevue/dynamicdialogoptions";
import {useToaster} from "@/utils/toaster.ts";

const dialogRef = inject<Ref<DynamicDialogInstance>>('dialogRef')
const toast = useToaster()
const orgListStore = useOrganizationListStore()

const orgName = ref('')

const placeholders = [
  'Серпы',
  'Парад Планет',
  'Гойдовцы',
  'Совет',
  'Пиг ман гусь',
  'Туалетное братство',
  'Сберпанк',
  'Kingsman',
  'Гамма'
]

const placeholder = ref('')

async function submit() {
  try {
    await orgListStore.create(orgName.value)
    toast.success('Организация создана')
    dialogRef?.value.close()
  } catch (e: any) {
    toast.error('Ошибка', e?.message ?? e.toString())
  }
}

onMounted(() => {
  placeholder.value = placeholders[Math.floor(Math.random() * placeholders.length)]

  dialogRef!.value.options.props = Object.assign(dialogRef!.value.options.props ?? {}, {
    header: `Создать организацию`,
    modal: true,
    style: { width: '25em' }
  } satisfies DialogProps)
})

</script>

<template>
<div class="p-3 flex flex-col gap-3">
  <InputText
    v-model="orgName"
    :maxlength="32"
    :placeholder="placeholder"
  />
  <Button @click="submit" class="mx-auto">Создать</Button>
</div>
</template>

<style scoped>

</style>