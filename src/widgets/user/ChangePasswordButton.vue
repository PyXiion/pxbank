<script lang="ts" setup>
import {useUserStore} from "@/stores/userStore.ts";
import {ref} from "vue";
import InputText from "primevue/inputtext";
import {useToaster} from "@/utils/toaster.ts";

const toast = useToaster()

const visible = ref(false)
const oldPassword = ref('')
const newPassword = ref('')

async function click() {
  const userStore = useUserStore()

  try {
    await userStore.updatePassword(oldPassword.value, newPassword.value)

    visible.value = false
    toast.success('Пароль изменён!')

    oldPassword.value = ''
    newPassword.value = ''
  } catch (e: any) {
    toast.error('Ошибка', e?.message ?? e?.toString())
  }
}
</script>

<template>
  <Dialog
    modal
    header="Смена пароля"
    v-model:visible="visible"
    class="w-[25em]"
  >
    <div class="flex flex-col gap-3 pt-3">
      <InputText v-model="oldPassword" type="password" placeholder="Старый пароль" :input-props="{autocomplete:'current-password'}"/>
      <InputText v-model="newPassword" type="password" placeholder="Новый пароль" :input-props="{autocomplete:'new-password'}"/>

      <span class="opacity-60">
        Если вы забыли свой старый пароль, то поменять
        его можно будет только с помощью администратора.
      </span>

      <div class="flex gap-3 justify-end">
        <Button severity="secondary" @click="visible = false">Отмена</Button>
        <Button @click="click">Подтвердить</Button>
      </div>
    </div>
  </Dialog>
  <Button @click="visible = !visible" v-bind="$attrs">
    <slot>Сменить пароль</slot>
  </Button>
</template>

<style scoped>

</style>