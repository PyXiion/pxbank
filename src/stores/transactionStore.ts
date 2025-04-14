import {defineStore} from "pinia";
import {ref} from "vue";
import {useProtocol} from "@/stores/protocolStore.ts";
import {type Transaction} from "@/types.ts";

export const useTransanctionStore = defineStore('transactionStore', () => {
    const transactions = ref<Transaction[]>([]);

    const currentPage = ref(1);
    const totalPages = ref(1);
    const total = ref(1);
    const perPage = ref(1);

    const isLoading = ref(false);
    const error = ref<unknown>(null);

    const {protocol} = useProtocol();

    async function fetchTransactions(username: string, page = 1) {
        isLoading.value = true;

        try {
            const body = {
                username,
                page
            }
            const response = await protocol.send("transactions/fetch", body);

            transactions.value = response.transactions;
            totalPages.value = response.total_pages;
            total.value = response.total
            perPage.value = response.per_page
            currentPage.value = page;
        } catch (e) {
            error.value = e;
        } finally {
            isLoading.value = false;
        }
    }

    function setPage(username: string, page: number) {
        if (page != currentPage.value && page < totalPages.value && page > 0) {
            fetchTransactions(username, page);
        }
    }

    return {
        transactions,
        isLoading,
        error,
        fetchTransactions,
        setPage,
        totalPages,
        currentPage,
        total,
        perPage
    }
});