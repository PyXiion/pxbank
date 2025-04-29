interface AccountPublicInfo {
    currency_id: number
    number: string
}

export interface AccountSettings {
    is_public: boolean
}

export interface Account extends AccountPublicInfo, AccountSettings {
    id: number
    name: string
    order_id: number

    currency_id: number
    balance: number
    can_manage: boolean
}

export interface Currency {
    id: number
    name: string
    icon_url: string
}

export interface Transaction {
    id: number;
    sender_name: string
    receiver_name: string

    amount: number
    comment?: string | null
    currency_id: number

    timestamp: number

    from_account_number: string
    to_account_number: string

    from_account_id?: number // есть, если есть доступ к этому счёту
    to_account_id?: number // есть, если есть доступ к этому счёту
}
