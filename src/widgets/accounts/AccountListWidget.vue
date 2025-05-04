<script lang="ts" setup>
import {computed, onMounted, watch} from 'vue';
import {useAccountStore} from '@/stores/accountStore';
import AccountWidget from '@/widgets/accounts/AccountWidget.vue';
import {useDialog} from "primevue";
import NewAccountDialog from "@/widgets/dialogs/NewAccountDialog.vue";

interface Props {
  ownerType: 'user' | 'org';
  ownerId: string | number;

  canManage?: boolean
}

const { ownerType, ownerId, canManage = false} = defineProps<Props>();

const accountStore = useAccountStore();
const dialog = useDialog()

// Load accounts for given owner on mount and when props change
function loadAccounts() {
  if (ownerType === 'user') {
    accountStore.fetchUser(ownerId as string);
  } else {
    accountStore.fetchOrg(ownerId as number);
  }
}

onMounted(loadAccounts);
watch(() => [ownerType, ownerId], loadAccounts);

const ownerKey = computed(() => `${ownerType}:${ownerId}`);
const ownerState = computed(() => accountStore.owners[ownerKey.value]);

const isLoading = computed(() => ownerState.value?.loading ?? true);
const error = computed(() => ownerState.value?.error);
const errorMessage = computed(() => {
  const err = error.value;
  return err instanceof Error ? err.message : String(err);
});
const accounts = computed(() => ownerState.value?.accounts ?? []);
</script>

<template>
  <div>
    <div v-if="isLoading" class="p-4 text-center">
      <span>Загрузка...</span>
      <i class="pi pi-spin pi-settings ml-2"/>
    </div>

    <div v-else-if="error" class="error-panel">
      Ошибка: {{ errorMessage }}
    </div>

    <div v-else class="space-y-4">
      <div class="space-y-4 h-1/1" v-if="accounts.length > 0">
        <transition-group name="fade">
          <AccountWidget
            v-for="acc in accounts"
            :key="acc.id"
            :data="acc"
            class="panel"/>
        </transition-group>
      </div>

      <div class="panel text-center" v-if="canManage">
        <p v-if="accounts.length === 0" class="mb-2">
          У вас пока нет счетов. Хотите создать?
        </p>
        <Button
          @click="dialog.open(NewAccountDialog, {data: {type: ownerType, target: ownerId}})"
        >
          Открыть счет
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
