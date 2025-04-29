<script lang="ts" setup>

import BasicUserOrgView from "@/views/BasicUserOrgView.vue";
import {computed, ref} from "vue";
import Avatar from '@/widgets/utils/Avatar.vue'
import TransactionHistory from "@/widgets/transactions/TransactionHistory.vue";
import AccountListWidget from "@/widgets/accounts/AccountListWidget.vue";

const orgInfo = ref({
  name: 'Бананчики',
  owner: {
    username: 'BANANA',
    role: 'owner'
  },
  members: [
    {
      username: 'PyXiion',
      role: 'admin'
    }
  ]
})

const allMembers = computed(() => [orgInfo.value.owner].concat(orgInfo.value.members))

</script>

<template>
  <BasicUserOrgView>
    <template #left>
      <section class="panel mb-3">
        <h2 class="text-2xl font-bold text-center mb-3">{{ orgInfo.name }}</h2>
        <p>Участников: {{ allMembers.length }}</p>
      </section>

      <AccountListWidget username="PyXiion"/>
    </template>

    <template #center>
      <TransactionHistory username="PyXiion" class="mb-3"/>

      <section class="panel mb-3 flex flex-col gap-3">
        <h2 class="text-xl text-center">Журнал действий</h2>

        <div class="flex">
          <img src="/banana-cheerer.gif" alt="banana.gif" class="m-auto h-[5.5em]" v-for="_ in 5"/>
        </div>
      </section>
    </template>

    <template #right>
      <section class="panel mb-3">
        <h2 class="text-2xl text-center">Участники</h2>
        <p class="text-center">Всего {{ orgInfo.members.length + 1}}</p>
      </section>

      <div class="flex flex-col gap-3 mb-3">
        <div
          class="border border-black/20 even:border-black/40 panel flex flex-col gap-3 hover:scale-105 transition"
          v-for="member in allMembers"
        >
          <div class="flex gap-3">
            <Avatar :name="member.username"/>
            <span class="font-[Minecraft]">{{member.username}}</span>
          </div>
        </div>
      </div>

      <section class="panel">
        <div class="w-1/1 flex flex-col gap-3">
          <Button class="w-1/1" size="small">Пригласить игрока</Button>
          <Button class="w-1/1" size="small" severity="info">Синяя кнопка</Button>
          <br/>
          <Button class="w-1/1" severity="warn" size="small">Передать организацию</Button>
          <Button class="w-1/1" severity="danger" size="small">Удалить организацию</Button>
        </div>
      </section>
    </template>
  </BasicUserOrgView>
</template>

<style scoped>

</style>