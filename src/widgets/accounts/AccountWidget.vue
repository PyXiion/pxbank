<script setup lang="ts">

import type {Account} from "@/types.ts";
import CurrencyIcon from "@/widgets/utils/CurrencyIcon.vue";
import ConfirmPopup from "primevue/confirmpopup"
import Popover from "primevue/popover"
import InputText from "primevue/inputtext"
import InputGroup from "primevue/inputgroup"
import InputGroupAddon from "primevue/inputgroupaddon"
import {useConfirm, useToast} from "primevue";
import Toast from 'primevue/toast';
import {computed, ref} from "vue";
import {useAccountStore} from "@/stores/accountStore.ts";
import {useToaster} from "@/utils/toaster.ts";
import BalanceWidget from "@/widgets/accounts/MoneyWidget.vue";
import {useUserStore} from "@/stores/userStore.ts";
interface Props {
  data: Account
}

const props = defineProps<Props>()
const confirm = useConfirm()
const toast = useToaster()
const accountStore = useAccountStore()
const userStore = useUserStore()

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

const toggleRenamePopup = ($event: MouseEvent) => {
  renameAccountPopover.value?.toggle($event, $event.target)
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

function copyNumber() {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(props.data.number)
    toast.success("Номер скопирован", undefined, 1000)
  } else {
    toast.error("Ошибка", "Доступ к буферу обмена запрещён")
  }
}

</script>

<template>
  <div class="p-3 relative min-w-60">
    <ConfirmPopup class="w-70"/>

    <Popover ref="renameAccountPopover" class="w-70">
      <p>Изменить имя</p>
      <InputGroup>
        <InputText v-model="accountName" @keydown.enter="renameThis"></InputText>
        <Button @click="renameThis"><i class="pi pi-save"></i></Button>
      </InputGroup>
    </Popover>

    <header class="relative">
      <h3 class="text">{{ accountDisplayName }}</h3>

      <div class="absolute top-0 right-0 flex gap-0.25" v-if="data.can_manage">
        <template v-if="userStore.isAdmin">
<!--          <i class="pi pi-wrench control-button" @click="toggleRenamePopup"></i>-->
        </template>
        <i class="pi pi-pencil control-button" @click="toggleRenamePopup"></i>
        <i class="pi pi-times control-button" @click="deleteConfirm"></i>
      </div>

    </header>

    <BalanceWidget
        class="text-[24px]/[24px]"
        :amount="data.balance"
        :currency-id="data.currency_id"
        icon-pos="left"
    />

    <div class="absolute bottom-3 right-3 opacity-50 cursor-pointer" @click="copyNumber">
      № {{ data.number }}
    </div>

  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.control-button {
  @apply text-muted-black;
  padding: calc(var(--spacing) * 0.8);
  border-radius: 6px;
  cursor: pointer;
  transition: font-size 0.15s ease-out;
}
.control-button:hover {
  color: var(--color-white);
  background: var(--color-primary-500);
  font-size: 1.15em;
}
.control-button.pi-times:hover {
  color: var(--color-white);
  background: var(--color-red-700)
}
</style>