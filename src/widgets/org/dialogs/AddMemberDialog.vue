<script setup lang="ts">
import {inject, onMounted, type Ref, ref, toRaw} from "vue";
import PlayerSelector from "@/widgets/utils/PlayerSelector.vue";
import type {DynamicDialogInstance} from "primevue/dynamicdialogoptions";
import type {DialogProps} from "primevue";
import {useOrganizationStore} from "@/stores/organizationStore.ts";
import {useToaster} from "@/utils/toaster.ts";

const HEADER = 'Добавить игроков'

const dialogRef = inject<Ref<DynamicDialogInstance>>('dialogRef')
const orgStore = useOrganizationStore()
const toast = useToaster()

const playerNames = ref<string[]>()

async function add() {
  try {
    await orgStore.addMembers(toRaw(playerNames.value!))
    toast.success('Игроки добавлены в организацию')
  } catch (e: any) {
    toast.error('Ошибка', e?.message ?? e.toString())
    throw e
  }
}

onMounted(() => {
  Object.assign(dialogRef!.value.options.props!, {
    header: HEADER,
    modal: true,
    style: { width: '25em' }
  } satisfies DialogProps)
})

</script>

<template>
  <div class="p-1 flex flex-col gap-3">
    <PlayerSelector
      v-model="playerNames"
      multiple
      class="w-1/1"
    />

    <Button class="mx-auto" @click="add" :disabled="!playerNames">Добавить</Button>
  </div>
</template>

<style scoped>

</style>