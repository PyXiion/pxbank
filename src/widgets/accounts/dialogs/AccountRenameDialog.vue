<script lang="ts" setup>
interface Emits {
  rename: [string]
}
const emit = defineEmits<Emits>()

const visible = defineModel<boolean>('visible')
const value = defineModel<string>({default: ''})

function save() {
  emit('rename', value.value)
  visible.value = false
}

</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Изменить имя"
    :closable="false"
    modal
  >
    <InputGroup class="p-1">
      <InputText v-model="value" @keydown.enter="save"></InputText>
      <Button @click="save"><i class="pi pi-save"></i></Button>
    </InputGroup>
  </Dialog>
</template>

<style scoped>

</style>