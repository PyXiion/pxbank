<script setup lang="ts">
import {useTransanctionStore} from "@/stores/transactionStore.ts";
import TransactionItem from "@/widgets/transactions/TransactionItem.vue";
import {computed, nextTick, onMounted, ref, watch} from "vue";
import type {Transaction} from "@/types.ts";
import {animate, utils} from 'animejs'

interface Props {
  username: string;
}

const props = defineProps<Props>();
const store = useTransanctionStore()

const errorText = computed(() => {
  if (store.error instanceof Error) {
    return store.error.message
  }

  return store.error?.toString()
})

const list = ref<HTMLDivElement>()

const transactions = ref<Transaction[]>()

const totalCount = ref(0)
const newCount = ref(0)

async function loadPage(page: number) {
  await store.fetchTransactions(props.username, page + 1)
}

async function loadTransactions() {
  if (props.username) {
    await store.fetchTransactions(props.username);
  }
}

onMounted(loadTransactions)

function onBeforeEnter(el: HTMLElement) {
  // el.style.rotateX = '180deg'
}

function onEnter(el: HTMLElement, done: () => void) {
  const index = parseInt((el as any).dataset.index, 10) || 0;

  animate(el, {
    opacity: [0, 1],
    scale: [0.9, 1],
    duration: 350,
    easing: 'easeOutExpo',
    delay: index * 65,
  }).then(done);
}
function onLeave(el: HTMLElement, done: () => void) {
  done()
}

watch(() => store.transactions, (newList, oldList) => {
  transactions.value = [...newList, ...oldList]
  totalCount.value = newList.length + oldList.length
  newCount.value = newList.length

  nextTick(() => {
    transactions.value = newList
  })
})

</script>

<template>
  <div class="panel-no-p overflow-hidden">
    <div class="p-3">
      <h2 class="text-xl text-center">Транзакции пользователя <span class="font-[Minecraft]">{{ username }}</span></h2>

      <p class="placeholder text-red-500!" v-if="store.error">Ошибка. {{ errorText }}</p>
      <p class="placeholder" v-else-if="!store.isLoading && store.transactions.length === 0">Пустота...</p>
    </div>


    <!--  Пагинация -->
    <div v-if="store.totalPages > 1">
      <Paginator :rows="store.perPage" :totalRecords="store.total" @page="loadPage($event.page)"/>
    </div>

    <div ref="list" v-if="!store.error">
      <TransitionGroup
          :css="false"
          type="animation"
          @before-enter="onBeforeEnter as any"
          @enter="onEnter as any"
          @leave="onLeave as any"
      >
        <TransactionItem
            v-for="(tx, index) in transactions"
            class="odd:bg-neutral-200 dark:odd:bg-neutral-600 px-3"
            :key="tx.id"
            :transaction="tx"
            :ownerUsername="username"
            :data-index="index"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.placeholder {
  @apply text-muted-black text-center p-1;
}

.list {
  transition: height 0.6s ease-out;
  overflow: hidden;
}
</style>