import {defineStore} from "pinia";
import {reactive, ref} from "vue";
import {type Account} from "@/types.ts";
import {useProtocol} from "@/stores/protocolStore.ts";

export interface AccountState {
    accounts: Account[]

    isLoading: boolean
    error: unknown
}

export const useAccountStore = defineStore('accountStore', () => {
    const {protocol} = useProtocol()
    const users = ref<{ [name: string]: AccountState }>({})
    const userById = reactive<{ [id: number]: string }>({})

    function getOrCreateState(username: string) {
        if (!(username in users.value)) {
            users.value[username] = {
                accounts: [],

                isLoading: true,
                error: null
            }
        }
        return users.value[username]
    }
    async function fetchUser(username: string) {
        const state = getOrCreateState(username)
        state.error = null
        state.isLoading = true
        try {
            const response = await protocol.send('accounts/fetch', {
                username
            })

            clearUser(username)
            state.accounts = response.accounts
            state.accounts.forEach(x => {
                userById[x.id] = username
            })
        } catch (e) {
            state.error = e
        } finally {
            state.isLoading = false
        }
    }

    function clearUser(username: string) {
        if (username ! in users.value)
            return
        const state = users.value[username]

        for (const acc of state.accounts) {
            delete userById[acc.id]
        }

        delete users.value[username]
    }

    async function create(username: string, name: string, currency_id: number) {
        const acc = await protocol.send('accounts/new', {
            username,
            name,
            currency_id
        })

        if (username in users.value) {
            users.value[username].accounts.push(acc)
            userById[acc.id] = username
        }
    }

    function getById(id: number) {
        if (!(id in userById))
            return null

        const accounts = users.value[userById[id]].accounts
        return accounts.find(x => x.id == id)
    }

    async function renameOne(id: number, new_name: string) {
        await protocol.send('accounts/rename', {
            account_id: id,
            new_name
        })

        const acc = getById(id)
        if (acc) {
            acc.name = new_name
        }
    }

    async function deleteOne(id: number) {
        await protocol.send('accounts/delete', {
            account_id: id
        })

        if (id in userById) {
            const username = userById[id]
            delete userById[id]

            const accounts = users.value[username].accounts

            accounts.splice(
                accounts.findIndex(x => x.id == id),
                1
            )
        }
    }

    async function transfer(from_account_id: number, to_account_id: number, amount: number, comment: string | null) {
        await protocol.send('accounts/transfer', {
            from_account_id,
            to_account_id,
            amount,
            comment
        })

        const fromAccount = getById(from_account_id)
        const toAccountId = getById(to_account_id)

        if (fromAccount)
            fromAccount.balance -= amount
        if (toAccountId)
            toAccountId.balance += amount
    }

    async function transferByNumber(from_account_id: number, number: string, amount: number, comment: string | null) {
        number = number.replace(/\D/g, "")
        await protocol.send('accounts/transfer/by_number', {
            from_account_id,
            to_account_number: number,
            amount,
            comment
        })

        const fromAccount = getById(from_account_id)

        if (fromAccount)
            fromAccount.balance -= amount
    }

    return {
        users,
        clearUser,
        fetchUser,
        hasUser(username: string) { return username in users.value },
        create,
        renameOne,
        deleteOne,
        getById,

        transfer,
        transferByNumber
    }
})