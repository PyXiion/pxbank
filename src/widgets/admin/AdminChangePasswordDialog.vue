<script lang="ts" setup>

import {useProtocol} from "@/stores/protocolStore.ts";
import {ref} from "vue";
import {useToaster} from "@/utils/toaster.ts";

interface Props {
  username: string
}

const props = defineProps<Props>()
const toast = useToaster()

const visible = defineModel<boolean>('visible');

const password = ref('')

async function click() {
  const {protocol} = useProtocol()
  try {
    await protocol.send('admin/change_password', {
      username: props.username,
      password: password.value
    })
    toast.success('Пароль изменён')
  } catch (e: any) {
    toast.error('Ошибка', e?.message ?? e.toString())
  } finally {
    visible.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="`Смена пароля для ${username}`"
    modal
  >
    <div class="flex flex-col gap-3 py-3">
      <InputText v-model="password"/>

      <Button @click="click">Установить</Button>
    </div>

  </Dialog>
</template>

<style scoped>

</style>