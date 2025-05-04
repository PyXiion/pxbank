import { defineStore } from 'pinia';
import { reactive, computed, toRefs } from 'vue';
import { type Account, type AccountSettings } from '@/types';
import { useProtocol } from '@/stores/protocolStore';

// Типы владельцев
type OwnerType = 'user' | 'org';

// Состояние аккаунтов одного владельца
interface OwnerState {
    accounts: Account[];
    loading: boolean;
    error: Error | null;
}

// Корень состояния стора
interface RootState {
    owners: Record<string, OwnerState>;      // ключ: "user:alice" или "org:42"
    accountToOwner: Record<number, string>;  // сопоставление accountId → ownerKey
}

export const useAccountStore = defineStore('account', () => {
    const { protocol } = useProtocol();
    const state = reactive<RootState>({
        owners: {},
        accountToOwner: {},
    });

    // Создаёт ключ вида "user:alice" или "org:42"
    function makeOwnerKey(type: OwnerType, id: string | number) {
        return `${type}:${id}`;
    }

    // Гарантирует существование записи для владельца
    function ensureOwner(key: string) {
        if (!state.owners[key]) {
            state.owners[key] = { accounts: [], loading: false, error: null };
        }
        return state.owners[key];
    }

    // Обновляет карту accountId → ownerKey
    function remapAccounts(key: string, accounts: Account[]) {
        // Удаляем старые
        for (const [accId, ownerKey] of Object.entries(state.accountToOwner)) {
            if (ownerKey === key) delete state.accountToOwner[+accId];
        }
        // Добавляем новые
        accounts.forEach(acc => {
            state.accountToOwner[acc.id] = key;
        });
    }

    // Загрузка аккаунтов владельца
    async function loadAccounts(type: OwnerType, id: string | number) {
        const key = makeOwnerKey(type, id);
        const ownerState = ensureOwner(key);
        ownerState.loading = true;
        ownerState.error = null;

        try {
            const route = 'accounts/fetch/' + type
            const response = await protocol.send(route, { id });
            ownerState.accounts = response.accounts;
            remapAccounts(key, response.accounts);
        } catch (err: any) {
            ownerState.error = err;
        } finally {
            ownerState.loading = false;
        }
    }

    // Публичные методы загрузки
    function fetchUser(username: string) {
        return loadAccounts('user', username);
    }

    function fetchOrg(orgId: number) {
        return loadAccounts('org', orgId);
    }

    // Очищает данные владельца
    function clearOwner(type: OwnerType, id: string | number) {
        const key = makeOwnerKey(type, id);
        const ownerState = state.owners[key];
        if (!ownerState) return;
        ownerState.accounts.forEach(acc => delete state.accountToOwner[acc.id]);
        delete state.owners[key];
    }

    // Создание нового аккаунта для пользователя
    async function createAccount(
      type: 'org' | 'user',
      target: string|number,
      name: string,
      currency_id: number
    ) {
        const acc: Account = await protocol.send('accounts/new/' + type, { id: target, name, currency_id });
        const key = makeOwnerKey(type, target);
        const ownerState = ensureOwner(key);
        ownerState.accounts.push(acc);
        state.accountToOwner[acc.id] = key;
        return acc;
    }

    // Поиск аккаунта по id
    function getAccountById(id: number): Account | undefined {
        const key = state.accountToOwner[id];
        return key ? state.owners[key]?.accounts.find(acc => acc.id === id) : undefined;
    }

    // Переименование аккаунта
    async function renameAccount(id: number, newName: string) {
        await protocol.send('accounts/rename', { account_id: id, new_name: newName });
        const acc = getAccountById(id);
        if (acc) acc.name = newName;
    }

    // Удаление аккаунта
    async function deleteAccount(id: number) {
        await protocol.send('accounts/delete', { account_id: id });
        const key = state.accountToOwner[id];
        if (!key) return;
        const ownerState = state.owners[key];
        ownerState.accounts = ownerState.accounts.filter(acc => acc.id !== id);
        delete state.accountToOwner[id];
    }

    // Обновление настроек аккаунта
    async function setSettings(id: number, settings: AccountSettings) {
        await protocol.send('accounts/settings', { account_id: id, ...settings });
        const acc = getAccountById(id);
        if (acc) Object.assign(acc, settings);
    }

    // Перевод средств
    async function transfer(
      fromId: number,
      toId: number,
      amount: number,
      comment: string | null = null
    ) {
        await protocol.send('accounts/transfer', { from_account_id: fromId, to_account_id: toId, amount, comment });
        const fromAcc = getAccountById(fromId);
        const toAcc = getAccountById(toId);
        if (fromAcc) fromAcc.balance -= amount;
        if (toAcc) toAcc.balance += amount;
    }

    // Перевод средств по номеру аккаунта
    async function transferByNumber(
      fromId: number,
      accountNumber: string,
      amount: number,
      comment: string | null = null
    ) {
        const toNumber = accountNumber.replace(/\D/g, '');
        await protocol.send('accounts/transfer/by_number', { from_account_id: fromId, to_account_number: toNumber, amount, comment });
        const fromAcc = getAccountById(fromId);
        if (fromAcc) fromAcc.balance -= amount;
    }

    // Смена публичного статуса
    async function setPublic(accountId: number, isPublic: boolean) {
        await protocol.send('accounts/public', { account_id: accountId, is_public: isPublic });
    }

    // Геттер для списка аккаунтов владельца
    const getAccountsFor = computed(() => (type: OwnerType, id: string | number) => {
        const key = makeOwnerKey(type, id);
        return state.owners[key]?.accounts || [];
    });

    return {
        ...toRefs(state),
        fetchUser,
        fetchOrg,
        clearOwner,
        createAccount,
        getAccountById,
        renameAccount,
        deleteAccount,
        setSettings,
        transfer,
        transferByNumber,
        setPublic,
        getAccountsFor,
    };
});
