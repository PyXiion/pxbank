import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Account } from '@/types.ts';

export const useTransferStore = defineStore('transfer', () => {
    const fromAccount = ref<Account | null>(null);
    const toAccount = ref<Account | null>(null);
    const accountNumber = ref("");
    const amount = ref<number>(0);
    const comment = ref<string>("");
    const playerName = ref<string>("");

    const scalars = ref([1, 9]);
    const currentScalarIndex = ref(0);

    const enabledMoneyInput = computed(() => {
        if (!fromAccount.value) return false;
        if (toAccount.value) return true;
        return !!accountNumber.value;
    });

    function clear() {
        fromAccount.value = null;
        toAccount.value = null;
        accountNumber.value = "";
        amount.value = 0;
        comment.value = "";
        playerName.value = "";
        currentScalarIndex.value = 0;
    }

    function nextScalar() {
        currentScalarIndex.value = (currentScalarIndex.value + 1) % scalars.value.length;
    }

    return {
        fromAccount,
        toAccount,
        accountNumber,
        amount,
        comment,
        playerName,
        scalars,
        currentScalarIndex,
        enabledMoneyInput,
        clear,
        nextScalar,
    };
});
