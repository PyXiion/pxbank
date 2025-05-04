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
import {useTransactionStore} from "@/stores/transactionStore.ts";
import {animate, utils} from "animejs";
import {API} from "@/api/search.ts";

type Type = 'number' | 'id' | 'by_name'

interface Props {
  type: Type
  ownerType: 'org' | 'user'
  ownerId: string | number
}

const props = defineProps<Props>()
const toast = useToaster()

const visible = ref(false)

const types = {
  'number': {
    text: "Перевод по номеру",
    details: 'Тут вы можете отправить деньги на чужой счёт по номеру этого счёта.'
  },
  'id': {
    text: "Перевод между счетами",
    details: 'Тут вы можете перевести средства меж своих счетов.'
  },
  'by_name': {
    text: 'Перевести',
    details: 'Тут вы можете перевести средства другому игроку, если у него есть публичный счёт.'
  }
}
const text = computed(() => types[props.type])

const MAX_COMMENT_LENGTH = 256

// INPUT
const fromAccount = ref<Account | null>(null)
const toAccount = ref<Account | null>(null)
const accountNumber = ref("")
const amount = ref<number>(0)
const comment = ref<string>("")
const playerName = ref<string>("")
// INPUT

const playerSuggestions = ref<string[]>([])

const scalars = ref([1, 9])
const currentScalarIndex = ref(0)

const scalarSpan = ref<HTMLSpanElement>()

watch(() => visible.value, (visible) => {
  if (visible === true)
    clear()
})

async function transfer() {
  const accountStore = useAccountStore()
  try {
    const realAmount = parseFloat(amount.value as any) * scalars.value[currentScalarIndex.value];
    if (props.type === 'id') {
      await accountStore.transfer(fromAccount.value!.id, toAccount.value!.id, realAmount, comment.value)
    } else {
      await accountStore.transferByNumber(fromAccount.value!.id, props.type === 'number' ? accountNumber.value : toAccount.value!.number, realAmount, comment.value)
    }
    toast.success('Перевод совершён!')
    visible.value = false

    await useTransactionStore().update()
  } catch (e: any) {
    toast.error('Не удалость совершить перевод', e?.message ?? e?.toString())
  }
}

function clear() {
  fromAccount.value = null
  toAccount.value = null
  accountNumber.value = ''
  amount.value = 0
  comment.value = ""
  currentScalarIndex.value = 0
  playerName.value = ""
}

function nextScalar() {
  currentScalarIndex.value = (currentScalarIndex.value + 1) % scalars.value.length
  animate(scalarSpan.value!, {
    textContent: `x${scalars.value[currentScalarIndex.value]}`,
    modifier: utils.round(0),
    duration: 600,
    ease: 'outExpo'
  })
}

async function updatePlayerSuggestions() {
  try {
    playerSuggestions.value = await API.searchUsers(playerName.value)
  } catch (e) {
    playerSuggestions.value = []
  }
}

const buttonActive = computed(() => {
  if (!fromAccount.value || !amount.value) return false;
  switch (props.type) {
    case "number":
      return !!accountNumber.value;
    case "by_name":
    case "id":
      return !!toAccount.value;
  }
  return false;
})
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

    <AccountSelect v-model="fromAccount" :owner-type="ownerType" :ownerId="ownerId" class="w-1/1 mb-4"/>

    <div v-if="type === 'number'">
      <InputGroup class="mb-4">
        <InputMask v-model="accountNumber" mask="999-999" placeholder="XXX-XXX"></InputMask>
        <InputGroupAddon><i class="pi pi-hashtag"></i></InputGroupAddon>
      </InputGroup>
    </div>
    <div v-else-if="type === 'id'">
      <AccountSelect
        v-model="toAccount"
        :disabled="!fromAccount"
        :exclude_id="fromAccount?.id"
        :required_currency="fromAccount?.currency_id"
        :owner-type="ownerType"
        :ownerId="ownerId"
        class="w-1/1 mb-4"
        placeholder="Выберите куда перевести"
      />
    </div>
    <div v-else>
      <InputGroup class="mb-4">
        <AutoComplete
          v-model="playerName"
          :suggestions="playerSuggestions"
          @complete="updatePlayerSuggestions"
          placeholder="Введите имя игрока"
          force-selection
        />
        <InputGroupAddon><i class="pi pi-user"></i></InputGroupAddon>
      </InputGroup>

      <AccountSelect
        v-model="toAccount"
        :exclude_id="fromAccount?.id"
        :required_currency="fromAccount?.currency_id"
        owner-type="user"
        :ownerId="playerName"
        class="w-1/1 mb-4"
        placeholder="Выберите счёт получателя"
      />
    </div>

    <InputGroup class="mb-4">
      <InputGroupAddon>
        <Transition name="reappear-transition">
          <i v-if="!fromAccount" class="pi pi-money-bill"></i>
          <CurrencyIcon v-else :currency-id="fromAccount.currency_id"/>
        </Transition>
      </InputGroupAddon>

      <InputNumber
        v-model="amount"
        :max="fromAccount?.balance ?? 0"
        :max-fraction-digits="2" :min="0"
        fluid
        locale="ru-RU"
        placeholder="Сколько перевести"
        @keydown.enter="transfer"
      />
      <InputGroupAddon class="cursor-pointer overflow-hidden" @click="nextScalar">
        <span ref="scalarSpan">
          x1
        </span>
      </InputGroupAddon>
    </InputGroup>

    <InputGroup>
      <InputGroupAddon class="cursor-pointer overflow-hidden" @click="nextScalar">
        <i class="pi pi-pencil"/>
      </InputGroupAddon>
      <InputText
        v-model="comment"
        placeholder="Комментарий"
        :maxlength="MAX_COMMENT_LENGTH"
      />
    </InputGroup>

    <div class="text-right opacity-50" :class="(MAX_COMMENT_LENGTH - comment.length) < 32 ? ['text-red-500'] : []">
      {{MAX_COMMENT_LENGTH - comment.length}}
    </div>

    <div class="flex justify-end gap-3 mt-8">
      <Button severity="secondary" @click="visible = false">Отмена</Button>
      <Button :disabled="!buttonActive" @click="transfer">Перевести</Button>
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