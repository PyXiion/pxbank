<script lang="ts" setup>
import type {Account, AccountSettings} from "@/types.ts";
import {computed, ref} from "vue";
import {useToaster} from "@/utils/toaster.ts";
import BalanceWidget from "@/widgets/accounts/MoneyWidget.vue";
import {useUserStore} from "@/stores/userStore.ts";
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import AccountRenameDialog from "@/widgets/accounts/dialogs/AccountRenameDialog.vue";
import {useAccountStore} from "@/stores/accountStore.ts";
import {useConfirm} from "primevue";
import AccountSettingsDialog from "@/widgets/accounts/dialogs/AccountSettingsDialog.vue";

interface Props {
  data: Account
}

const props = defineProps<Props>()
const toast = useToaster()
const accountStore = useAccountStore()
const menu = ref();
const accountName = ref(props.data.name)
const accountDisplayName = computed(() => !!accountName.value.trim() ? accountName.value.trim() : 'Безымянный счёт')
const confirm = useConfirm()

const renameDialogVisible = ref(false)
const settingsDialogVisible = ref(false)

const items = ref([
  {
    label: 'Действия со счётом',
    items: [
      {
        label: 'Переименовать',
        icon: 'pi pi-pencil',
        command: () => renameDialogVisible.value = true
      },
      {
        label: 'Удалить',
        icon: 'pi pi-trash',
        command: del
      },
      {
        label: 'Настройки',
        icon: 'pi pi-wrench',
        command: () => settingsDialogVisible.value = true
      }
    ]
  }
]);

function copyNumber() {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(props.data.number)
    toast.success("Номер скопирован", undefined, 1000)
  } else {
    toast.error("Ошибка", "Доступ к буферу обмена запрещён")
  }
}

const toggleMenu = (event: any) => {
  menu.value.toggle(event);
};

async function rename(name: string) {
  try {
    await accountStore.renameAccount(props.data.id, name)
    toast.success('Счёт переименован')
  } catch (e: any) {
    toast.error('Ошибка', e?.message ?? e.toString())
  }
}

async function del() {
  confirm.require({
    message: "Вы уверены, что хотите удалить этот счёт?",
    header: "Подтверждение",
    icon: 'pi pi-exclamation-triangle',
    modal: true,
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
        await accountStore.deleteAccount(props.data.id)
        toast.success('Счёт удалён')
      } catch (e: any) {
        toast.error('Ошибка', e?.message ?? e.toString())
      }
    },
  })
}

async function updateSettings(settings: AccountSettings) {
  try {
    await accountStore.setSettings(props.data.id, settings)
    toast.success('Настройки применены')
    Object.assign(props.data, settings)
  } catch (e: any) {
    toast.error('Ошибка', e?.message ?? e.toString())
  }
}

</script>

<template>
  <div class="p-3 relative min-w-60">
    <AccountRenameDialog
      v-model="accountName"
      v-model:visible="renameDialogVisible"
      @rename="rename"
    />
    <AccountSettingsDialog
      v-model:visible="settingsDialogVisible"
      :account="data"
      @save="updateSettings"
    />
    <header>
      <h3 class="text"><i class="pi" :class="[data.is_public ? 'pi-lock-open' : 'pi-lock']"></i> {{ accountDisplayName }}</h3>

      <div v-if="data.can_manage" class="absolute top-1 right-1">
        <Button
          aria-controls="account-menu"
          aria-haspopup="true"
          class="p-button-text p-button-rounded p-button-plain w-[1em]! h-[1em]!"
          icon="pi pi-ellipsis-v text-[0.8em]!"
          size="small"
          type="button"
          @click="toggleMenu"
        />
        <Menu
          id="account-menu"
          ref="menu"
          :model="items"
          :popup="true"
        />
      </div>
    </header>

    <BalanceWidget
      :amount="data.balance"
      :currency-id="data.currency_id"
      class="text-[24px]/[24px]"
      icon-pos="left"
    />

    <div class="absolute bottom-3 right-3 opacity-50 cursor-pointer" @click="copyNumber">
      № {{ data.number }}
    </div>
  </div>
</template>

<style scoped>
</style>