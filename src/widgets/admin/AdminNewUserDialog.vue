<script lang="ts" setup>

import {useProtocol} from "@/stores/protocolStore.ts";
import {ref} from "vue";
import {useToaster} from "@/utils/toaster.ts";


const toast = useToaster()

const visible = defineModel<boolean>('visible');

const username = ref('')
const password = ref('')

async function click() {
  const {protocol} = useProtocol()
  try {
    await protocol.send('admin/new_user', {
      username: username.value,
      password: password.value
    })
    toast.success('Пользователь создан')

    username.value = ''
    password.value = ''
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
    header="Создать нового пользователя"
    modal
  >
    <div class="flex flex-col gap-3 py-3">
      <InputText v-model="username" placeholder="Логин"/>
      <InputText v-model="password" placeholder="Пароль"/>

      <Button @click="click">Установить</Button>
    </div>

  </Dialog>
</template>

<style scoped>

</style>