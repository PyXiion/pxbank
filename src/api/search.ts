import {useProtocol} from "@/stores/protocolStore.ts";
import type {Account} from "@/types.ts";

export namespace API {
    export async function searchUsers(username: string): Promise<string[]> {
        const {protocol} = useProtocol();
        return await protocol.send('search/users', {username})
    }

    export async function getAccounts(type: 'org' | 'user', id: string | number): Promise<Account[]> {
        const {protocol} = useProtocol();
        return (await protocol.send('accounts/fetch/' + type, {id})).accounts
    }
}