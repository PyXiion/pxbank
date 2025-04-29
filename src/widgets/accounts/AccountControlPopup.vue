<script setup lang="ts">

import type {Account} from "@/types.ts";
import {computed, ref} from "vue";
import {Menu, useConfirm} from "primevue";
import {useAccountStore} from "@/stores/accountStore.ts";
import {useToaster} from "@/utils/toaster.ts";
import Popover from "primevue/popover";

interface Props {
  data: Account
}

const props = defineProps<Props>()
const accountStore = useAccountStore()
const toast = useToaster()

const iconElem = ref<HTMLElement>()
const menu = ref<InstanceType<typeof Menu>>()
const confirm = useConfirm()
const renameAccountPopover = ref<InstanceType<typeof Popover>>()

const accountName = ref(props.data.name)
const accountDisplayName = computed(() => !!accountName.value.trim() ? accountName.value.trim() : 'Безымянный счёт')

const deleteConfirm = ($event: MouseEvent) => {
  confirm.require({
    target: $event.target as HTMLElement,
    message: `Вы уверены, что хотите удалить счёт "${accountDisplayName.value}"?`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Отмена',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Удалить',
      severity: 'danger'
    },
    async accept() {
      try {
        await accountStore.deleteOne(props.data.id);
        toast.success('Счёт был удалён.', 'Совсем и безвозвратно...')
      } catch (e: any) {
        toast.warn('Ошибка', e?.message ?? e?.toString())
      }
    },
  })
}

function mainPopoverToggle($event: MouseEvent) {
  menu.value!.toggle($event)
}

const toggleRenamePopup = ($event: MouseEvent) => {
  renameAccountPopover.value!.toggle($event)
}

async function renameThis() {
  renameAccountPopover.value?.hide()
  try {
    await accountStore.renameOne(props.data.id, accountName.value)
    toast.success('Счёт переименован')
  } catch (e) {
    accountName.value = props.data.name
    toast.error('Ошибка', e?.toString())
  }
}

const items = [
  {
    label: 'Переименовать',
    icon: 'pi pi-pencil',
    command: ($: any) => toggleRenamePopup($)
  },
  {
    label: 'Удалить',
    icon: 'pi pi-trash',
    command: ($: any) => deleteConfirm($)
  },
]

</script>

<template>
  <ConfirmPopup class="w-70"/>

  <Popover ref="renameAccountPopover" class="w-70">
    <p>Изменить имя</p>
    <InputGroup>
      <InputText v-model="accountName" @keydown.enter="renameThis"></InputText>
      <Button @click="renameThis"><i class="pi pi-save"></i></Button>
    </InputGroup>
  </Popover>

  <i ref="iconElem" class="pi pi-ellipsis-v control-button" @click="mainPopoverToggle"></i>
  <Menu ref="menu" :model="items" popup />
</template>

<style scoped>

</style>