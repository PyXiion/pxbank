<script lang="ts" setup>
import Button from "primevue/button";
import {computed, ref, watch} from "vue";
import Dialog from "primevue/dialog";
import InputGroup from "primevue/inputgroup";
import AccountSelect from "@/widgets/accounts/AccountSelect.vue";
import type {Account} from "@/types.ts";
import CurrencyIcon from "@/widgets/utils/CurrencyIcon.vue";
import {useAccountStore} from "@/stores/accountStore.ts";
import {useToaster} from "@/utils/toaster.ts";

interface Props {
  type: 'number' | 'id'
  username: string
}

const props = defineProps<Props>()
const toast = useToaster()

const visible = ref(false)
const text = computed(() => props.type === 'number' ? {
  text: "Перевод по номеру",
  details: 'Тут вы можете отправить деньги на чужой счёт по номеру этого счёта.'
} : {
  text: "Перевод между счетами",
  details: 'Тут вы можете перевести средства меж своих счетов.'
})

const fromAccount = ref<Account | null>(null)
const toAccount = ref<Account | null>(null)
const accountNumber = ref("")
const amount = ref<number>(0)

const enabledMoneyInput = computed(() => props.type === 'id' ? !!toAccount.value : (!!fromAccount.value && !!accountNumber.value))

watch(() => visible.value, (visible) => {
  if (visible === true)
    clear()
})

async function transfer() {
  const accountStore = useAccountStore()
  try {
    if (props.type === 'id') {
      await accountStore.transfer(fromAccount.value!.id, toAccount.value!.id, parseFloat(amount.value as any))
    } else {
      await accountStore.transferByNumber(fromAccount.value!.id, accountNumber.value, parseFloat(amount.value as any))
    }
    toast.success('Перевод совершён!')
    visible.value = false
  } catch (e: any) {
    toast.error('Не удалость совершить перевод', e?.message ?? e?.toString())
  }
}

function clear() {
  fromAccount.value = null
  toAccount.value = null
  accountNumber.value = ''
  amount.value = 0
}

</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="text.text"
    class="w-[25rem]"
    modal
  >
    <span class="block mb-3 text-surface-500 dark:text-surface-400">
      {{ text.details }}
    </span>

    <AccountSelect v-model="fromAccount" :username_from="username" class="w-1/1 mb-4"/>

    <div v-if="type === 'number'">
      <InputGroup class="mb-4">
        <InputMask v-model="accountNumber" mask="999-999" placeholder="XXX-XXX"></InputMask>
        <InputGroupAddon><i class="pi pi-hashtag"></i></InputGroupAddon>
      </InputGroup>
    </div>
    <div v-else>
      <AccountSelect
        v-model="toAccount"
        :disabled="!fromAccount"
        :exclude_id="fromAccount?.id"
        :required_currency="fromAccount?.currency_id"
        :username_from="username"
        class="w-1/1 mb-4"
        placeholder="Выберите куда перевести"
      />
    </div>

    <InputGroup>
      <InputNumber
        v-model="amount"
        :disabled="!enabledMoneyInput"
        :max="fromAccount?.balance ?? 0"
        :max-fraction-digits="2" :min="0"
        fluid
        locale="ru-RU"
        placeholder="Сколько перевести"
        @keydown.enter="transfer"
      >

      </InputNumber>
      <InputGroupAddon>
        <Transition name="reappear-transition">
          <i v-if="!fromAccount" class="pi pi-money-bill"></i>
          <CurrencyIcon v-else :currency-id="fromAccount.currency_id"/>
        </Transition>
      </InputGroupAddon>
    </InputGroup>

    <div class="flex justify-end gap-3 mt-8">
      <Button severity="secondary" @click="visible = false">Отмена</Button>
      <Button @click="transfer">Перевести</Button>
    </div>
  </Dialog>

  <Button class="w-1/1" v-bind="$attrs" @click="visible = true">
    <slot>
      {{ text.text }}
    </slot>
  </Button>
</template>

<style scoped>

</style>