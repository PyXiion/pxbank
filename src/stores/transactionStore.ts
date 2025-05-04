import {defineStore} from "pinia";
import {ref} from "vue";
import {useProtocol} from "@/stores/protocolStore.ts";
import {type Transaction} from "@/types.ts";

export const useTransactionStore = defineStore('transactionStore', () => {
  const transactions = ref<Transaction[]>([]);

  const currentType = ref<'user'|'org'>()
  const currentUsername = ref('');
  const currentOrgId = ref<null | string | number>(null); // Поддержка организации
  const currentPage = ref(1);
  const totalPages = ref(1);
  const total = ref(1);
  const perPage = ref(1);

  const isLoading = ref(false);
  const error = ref<unknown>(null);

  const {protocol} = useProtocol();

  // Функция для загрузки транзакций
  async function fetchTransactions(type: 'user' | 'org', ownerId: string | number, page = 1) {
    isLoading.value = true;
    error.value = null;
    transactions.value = [];

    try {
      const route = 'transactions/fetch/' + type;
      const body = {
        page,
        [type === 'user' ? 'username' : 'org_id']: ownerId, // Поддержка типов 'user' и 'org'
      };
      const response = await protocol.send(route, body);

      currentType.value = type
      if (type === 'user') {
        currentUsername.value = ownerId as string;
        currentOrgId.value = null; // Очищаем, если это пользователь
      } else {
        currentOrgId.value = ownerId;
        currentUsername.value = ''; // Очищаем, если это организация
      }

      transactions.value = response.transactions;
      totalPages.value = response.total_pages;
      total.value = response.total;
      perPage.value = response.per_page;
      currentPage.value = page;
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }

  // Функция для обновления транзакций (например, для добавления новых)
  async function update() {
    const ownerId = currentType.value === 'user' ? currentUsername.value! : currentOrgId.value!
    const body = {
      page: currentPage.value,
      [currentType.value === 'user' ? 'username' : 'org_id']: ownerId, // Поддержка типов 'user' и 'org'
    };
    const response = await protocol.send('transactions/fetch/' + currentType.value, body);

    let i = 0;
    (response.transactions as Transaction[]).forEach((tx) => {
      if (tx.id !== transactions.value[i].id) {
        transactions.value.splice(i, 0, tx);
      }
      ++i;
    });

    transactions.value.splice(10); // Оставляем только 10 последних транзакций
  }

  // Функция для установки текущей страницы
  function setPage(page: number) {
    if (page !== currentPage.value && page <= totalPages.value && page > 0) {
      fetchTransactions(currentUsername.value ? 'user' : 'org', currentUsername.value || currentOrgId.value!, page);
    }
  }

  // Функция для добавления транзакции по ID (если это необходимо)
  function checkAndAddTransactionById(id: number) {
    // Реализовать логику добавления транзакции по ID, если требуется
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
    perPage,
    currentUsername,
    currentOrgId, // Добавленное свойство для текущей организации
  };
});
