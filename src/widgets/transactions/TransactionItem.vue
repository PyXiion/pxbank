<script setup lang="ts">
import type {Transaction} from "@/types.ts";
import Avatar from "@/widgets/utils/Avatar.vue";
import TimestampWidget from "@/widgets/utils/TimestampWidget.vue";
import {computed} from "vue";
import {useAccountStore} from "@/stores/accountStore.ts";
import MoneyWidget from "@/widgets/accounts/MoneyWidget.vue";

interface Props {
  transaction: Transaction;
  ownerUsername?: string;
}

const props = defineProps<Props>();

const accountStore = useAccountStore();

const isDeposit = computed(() => {
  if (!props.ownerUsername) return false;
  return props.transaction.receiver_name === props.ownerUsername;
});

const isWithdrawal = computed(() => {
  if (!props.ownerUsername) return false;
  return props.transaction.sender_name === props.ownerUsername;
});

const isBetweenUserAccounts = computed(() => {
  if (!props.ownerUsername) return false;
  return (
      props.transaction.sender_name === props.ownerUsername &&
      props.transaction.receiver_name === props.ownerUsername
  );
});

const fromAccount = computed(() => {
  if (!props.transaction.from_account_id) return null;
  return accountStore.getById(props.transaction.from_account_id);
});

const toAccount = computed(() => {
  if (!props.transaction.to_account_id) return null;
  return accountStore.getById(props.transaction.to_account_id);
});

</script>

<template>
  <div class="flex items-center gap-2 p-2">
    <!-- Direction Icon -->
    <i
        v-if="ownerUsername"
        class="pi text-lg mr-1"
        :class="[ isBetweenUserAccounts ? 'pi-arrow-right-arrow-left' : (isDeposit ? 'pi-download text-green-500' : 'pi-upload text-red-500' )]"
    ></i>

    <!-- Avatar (other party) -->
    <Avatar
        v-if="!isBetweenUserAccounts && ownerUsername"
        :name="isDeposit ? transaction.sender_name : transaction.receiver_name"
        :size="32"
    />
    <Avatar
        v-else-if="!ownerUsername"
        :name="transaction.sender_name"
        :size="32"
    />

    <!-- Account Names -->
    <div class="flex flex-col flex-1">
      <div class="text-sm text-gray-800 dark:text-gray-200">
        <span class="max-sm:block">{{ isBetweenUserAccounts ? "Между своими аккаунтами" : "Перевод" }}</span>
        <TimestampWidget
            class="sm:ml-2 text-xs text-gray-400 inline"
            :timestamp="transaction.timestamp"
        />
      </div>

      <!-- Between user accounts -->
      <template v-if="isBetweenUserAccounts">

        <div class="text-xs opacity-60">
          {{ fromAccount?.name || 'Счёт № ' + transaction.from_account_number }}
          →
          {{ toAccount?.name || 'Счёт № ' + transaction.to_account_number }}
        </div>
      </template>


      <!-- With another user -->
      <template v-else-if="ownerUsername">
        <div class="text-sm">
          <span class="font-[Minecraft]">
            {{ isDeposit ? transaction.sender_name : transaction.receiver_name }}</span>
        </div>
        <div class="text-xs text-gray-500">
          {{ fromAccount?.name || 'Счёт № ' + transaction.from_account_number }}
          →
          {{ toAccount?.name || 'Счёт № ' + transaction.to_account_number }}
        </div>
      </template>

      <!-- General listing -->
      <template v-else>
        <div class="text-sm text-gray-800">
          {{ transaction.sender_name }} → {{ transaction.receiver_name }}
        </div>
        <div class="text-xs text-gray-500">
          {{ fromAccount?.name || 'Счёт №' + transaction.from_account_number }} →
          {{ toAccount?.name || 'Счёт №' + transaction.to_account_number }}
        </div>
      </template>

      <template v-if="transaction.comment">
        <div>
          {{transaction.comment}}
        </div>
      </template>
    </div>

    <!-- Amount -->
    <MoneyWidget
        icon-pos="right"
        :currency-id="transaction.currency_id"
        :amount="transaction.amount"
        :class="[isDeposit && !isBetweenUserAccounts ? 'text-green-600' : '']"
    />
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";
</style>
