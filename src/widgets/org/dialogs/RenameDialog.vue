<script lang="ts" setup>
import {inject, onMounted, ref, type Ref, toRaw} from "vue";
import type {DynamicDialogInstance} from "primevue/dynamicdialogoptions";
import type {DialogProps} from "primevue";

const value = ref('')
const dialogRef = inject<Ref<DynamicDialogInstance>>('dialogRef')

function submit() {
  dialogRef!.value.close({
    name: toRaw(value.value)
  })
}

onMounted(() => {
  value.value = dialogRef!.value.data?.value ?? ''

  dialogRef!.value.options.props = Object.assign(dialogRef!.value.options.props ?? {}, {
    header: `Переименовать организацию ${value.value}`,
    modal: true,
    style: { width: '25em' }
  } satisfies DialogProps)
})
</script>

<template>
  <div class="p-1 flex flex-col gap-3">
    <InputText v-model="value" :maxlength="32"/>
    <Button @click="submit">Сохранить</Button>
  </div>
</template>

<style scoped>

</style>