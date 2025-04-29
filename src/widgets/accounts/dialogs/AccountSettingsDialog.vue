<script lang="ts" setup>
import type {Account, AccountSettings} from "@/types.ts";
import {onMounted, ref} from "vue";

interface Props {
  account: Account
}
const props = defineProps<Props>()

interface Emit {
  save: [AccountSettings]
}
const emit = defineEmits<Emit>()


const visible = defineModel<boolean>('visible')

const isPublic = ref(false)

onMounted(updateValues)

function updateValues() {
  isPublic.value = props.account.is_public
}

function save() {
  visible.value = false;
  emit('save', {
    is_public: isPublic.value
  })
}

</script>

<template>
  <Dialog
    header="Настройки счёта"
    v-model:visible="visible"
    modal
    :closable="false"
  >
    <div class="p-1 mb-4">
      <div class="flex items-center gap-2">
        <Checkbox input-id="isPublic" v-model="isPublic" binary/>
        <label for="isPublic">Публичный</label>
      </div>
    </div>
    <div>
      <Button class="w-1/1" @click="save">Сохранить</Button>
    </div>
  </Dialog>
</template>

<style scoped>

</style>