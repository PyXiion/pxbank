<script setup lang="ts">
import Popover from "primevue/popover";
import {Menu, useConfirm} from "primevue";
import {computed, ref} from "vue";
import type {OrganizationMember} from "@/types.ts";
import {useToaster} from "@/utils/toaster.ts";
import {useOrganizationStore} from "@/stores/organizationStore.ts";
import Button from "primevue/button";

interface Props {
  member: OrganizationMember
}
const {member} = defineProps<Props>()

const confirm = useConfirm()
const toast = useToaster()
const orgStore = useOrganizationStore()

const menu = ref<InstanceType<typeof Menu>>()

function mainPopoverToggle($event: MouseEvent) {
  menu.value!.toggle($event)
}

const isAdmin = computed(() => member.role === 'admin')

function switchAdminConfirm($: any) {
  confirm.require({
    target: $.target as HTMLElement,
    message: `Вы уверены, что хотите сделать ${member.username} ${member.role === 'admin' ? 'простым пользователем' : 'админом'}?`,
    header: "Подтверждение",
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Отмена',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Воистину',
    },
    modal: true,
    async accept() {
      try {
        await orgStore.setMemberRole(member.username, member.role === 'admin' ? 'member' : 'admin')
        toast.success('Роль изменена')
      } catch (e: any) {
        toast.error('Ошибка', e?.message ?? e?.toString())
      }
    },
  })
}

function kickConfirm($: any) {
  confirm.require({
    target: $.target as HTMLElement,

    message: `Вы уверены, что хотите кикнуть ${member.username}?`,
    header: "Подтверждение",
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Отмена',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Кикнуть',
      severity: 'danger'
    },
    modal: true,
    async accept() {
      try {
        await orgStore.kickMember(member.username)
        toast.success('Игрок был кикнут.')
      } catch (e: any) {
        toast.error('Ошибка', e?.message ?? e?.toString())
      }
    },
  })
}

const items = computed(() => {
  const ownRole = orgStore.data?.access_role
  const r = []

  if (ownRole === 'owner') {
    r.push({
      label: isAdmin.value ? 'Забрать админку' : 'Дать админку',
      icon: 'pi pi-chevron-' + (isAdmin.value ? 'down' : 'up'),
      command: ($: any) => switchAdminConfirm($)
    })
  }
  if (ownRole === 'owner' || ownRole === 'admin' && member.role === 'member') {
    r.push({
      label: 'Кикнуть',
      icon: 'pi pi-trash',
      command: ($: any) => kickConfirm($)
    })
  }

  return r;
})

</script>

<template>
  <Button
    aria-controls="member-menu"
    aria-haspopup="true"
    class="p-button-text p-button-rounded p-button-plain w-[1.2em]! h-[1.2em]!"
    icon="pi pi-ellipsis-v control-button text-[0.85em]!"
    size="small"
    type="button"
    @click="mainPopoverToggle"
  />
  <Menu
    id="member-menu"
    ref="menu"
    :model="items" popup
  />
</template>

<style scoped>

</style>