<script lang="ts" setup>

import BasicUserOrgView from "@/views/BasicUserOrgView.vue";
import {computed, onMounted, toRaw, useSSRContext, watch} from "vue";
import Avatar from '@/widgets/utils/Avatar.vue'
import TransactionHistory from "@/widgets/transactions/TransactionHistory.vue";
import AccountListWidget from "@/widgets/accounts/AccountListWidget.vue";
import {useRoute, useRouter} from "vue-router";
import {useOrganizationStore} from "@/stores/organizationStore.ts";
import {useUserStore} from "@/stores/userStore.ts";
import MemberList from "@/widgets/org/MemberList.vue";
import {useConfirm, useDialog} from "primevue";
import AddMemberDialog from "@/widgets/org/dialogs/AddMemberDialog.vue";
import RenameDialog from "@/widgets/org/dialogs/RenameDialog.vue";
import {useToaster} from "@/utils/toaster.ts";
import TransferButton from "@/widgets/operations/TransferButton.vue";

const route = useRoute<"org">()
const dialog = useDialog()
const orgStore = useOrganizationStore()
const toast = useToaster()
const confirm = useConfirm()
const router = useRouter()

const orgId = computed(() => parseInt(<string>route.params.orgId))
const orgInfo = computed(() => orgStore.data)

const allMembers = computed(() => orgInfo.value !== null ? [orgInfo.value.owner].concat(orgInfo.value.members) : [])

onMounted(() => {
  orgStore.fetch(orgId.value)
})

watch(() => orgId.value, () => {
  orgStore.fetch(orgId.value)
})

function addPlayer() {
  dialog.open(AddMemberDialog, {
    props: { modal: true, style: { width: '30em' } }
  })
}

function rename() {
  if (!orgInfo.value) return

  dialog.open(RenameDialog, {
    data: { value: orgInfo.value.name },
    async onClose(options: any) {
      if (!options.data.name) return
      try {
        await orgStore.rename(toRaw(options.data.name))
        toast.success('Успешно')
      } catch (e: any) {
        toast.error('Ошибка', e?.message ?? e.toString())
      }
    },
  })
}

function leave() {
  confirm.require({
    modal: true,
    header: 'Покинуть организацию',
    message: 'Вы не сможете вернуться, пока вас снова не добавят.',
    acceptLabel: 'Покинуть',

    rejectProps: {
      label: 'Остаться',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Покинуть',
      severity: 'danger'
    },

    async accept() {
      try {
        await orgStore.leave()
        toast.success('Вы покинули организацию')
        await router.push({name: 'orgList'})
      } catch (e: any) {
        toast.error('Ошибка', e?.message ?? e.toString())
      }
    }

  })
}

</script>

<template>
  <BasicUserOrgView>
    <template #left>
      <section class="panel mb-4 space-y-3" v-if="orgInfo">
        <h2 class="text-2xl font-bold text-center">
          {{ orgInfo.name }}
          <i v-if="orgStore.isAdmin" class="pi pi-pencil cursor-pointer" @click="rename" />
        </h2>

        <div class="w-1/1 space-y-3">
          <Button class="w-1/1" size="small" v-if="orgStore.isAdmin" @click="addPlayer">Пригласить игрока</Button>

          <Button v-if="orgStore.isOwner" class="w-1/1" severity="warn" size="small" disabled>Передать организацию</Button>
          <Button v-if="orgStore.isOwner" class="w-1/1" severity="danger" size="small" disabled>Удалить организацию</Button>
          <Button class="w-1/1" severity="danger" size="small" v-if="!orgStore.isOwner" @click="leave">Покинуть</Button>
        </div>
      </section>

      <section class="panel mb-3" v-if="orgInfo">
        <h2 class="text-2xl text-center">Участники</h2>
        <p v-if="orgInfo" class="text-center opacity-70">{{ orgInfo.member_count }}/{{ orgInfo.member_limit }}
          <span
            v-tooltip.top="'Максимальное количество участников ограничено. Увеличение обговаривается индивидуально.'"
            class="cursor-help"
          >
            (?)
          </span>
        </p>
      </section>

      <div class="space-y-2 mb-3">
        <MemberList :members="allMembers"/>
      </div>

    </template>

    <template #center>
      <section class="panel mb-4">
        <div class="flex gap-3">
          <TransferButton owner-type="org" type="by_name" :owner-id="orgId"/>
          <TransferButton owner-type="org" type="number" :owner-id="orgId"/>
          <TransferButton owner-type="org" type="id" :owner-id="orgId"/>
        </div>
      </section>

      <TransactionHistory
        v-if="orgInfo"
        :owner-id="orgInfo.id"
        owner-type="org"
        class="mb-3"
      />

      <section class="panel mb-3 flex flex-col gap-3" v-if="false">
        <h2 class="text-xl text-center">Журнал действий</h2>

        <div class="flex">
          <img v-for="_ in 5" alt="banana.gif" class="m-auto h-[5.5em]" src="/banana-cheerer.gif"/>
        </div>
      </section>
    </template>

    <template #right>
      <AccountListWidget
        v-if="orgInfo"
        :owner-id="orgInfo.id" o
        owner-type="org"
        :can-manage="orgStore.isAdmin"
      />
    </template>

  </BasicUserOrgView>
</template>

<style scoped>

</style>