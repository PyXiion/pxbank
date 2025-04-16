import {defineStore} from "pinia";
import {ref} from "vue";
import {useProtocol} from "@/stores/protocolStore.ts";
import {type Transaction} from "@/types.ts";

export const useTransanctionStore = defineStore('transactionStore', () => {
    const transactions = ref<Transaction[]>([]);

    const currentUsername = ref('')
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

            currentUsername.value = username
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

    async function update() {
        const body = {
            username: currentUsername.value,
            page: currentPage.value
        }
        const response = await protocol.send("transactions/fetch", body);

        console.log([...transactions.value])
        console.log(response.transactions)

        let i = 0;
        (response.transactions as Transaction[]).forEach((tx) => {
            if (tx.id !== transactions.value[i].id) {
                transactions.value.splice(i, 0, tx)
            }
            ++i;
        })

        transactions.value.splice(10)
        console.log([...transactions.value])
    }

    function setPage(page: number) {
        if (page != currentPage.value && page < totalPages.value && page > 0) {
            fetchTransactions(currentUsername.value, page);
        }
    }

    function checkAndAddTransactionById(id: number) {

    }

    return {
        transactions,
        isLoading,
        error,
        fetchTransactions,
        update,
        setPage,
        totalPages,
        currentPage,
        total,
        perPage
    }
});