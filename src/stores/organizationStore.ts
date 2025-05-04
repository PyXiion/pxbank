import {defineStore} from "pinia";
import {computed, ref} from "vue";
import type {Organization, OrganizationMember, OrganizationRole, OrganizationShortInfo} from "@/types.ts";
import {useProtocol} from "@/stores/protocolStore.ts";

export const useOrganizationListStore = defineStore('orgList', () => {
  const data = ref<OrganizationShortInfo[]>([])
  const isLoading = ref(true)
  const error = ref<unknown>(null)
  const {protocol} = useProtocol()

  async function fetch() {
    isLoading.value = true
    error.value = null

    try {
      data.value = await protocol.send('org/list')

      isLoading.value = false
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  async function create(name: string) {
    const org = await protocol.send('org/create', {name})
    data.value.push(org)
  }

  return {
    data, isLoading, error,
    fetch,

    create,
  }
})

export const useOrganizationStore = defineStore('org', () => {
  const data = ref<Organization|null>(null)
  const isLoading = ref(true)
  const error = ref<unknown>(null)
  const {protocol} = useProtocol()

  const isOwner = computed(() => data.value?.access_role === 'owner')
  const isAdmin = computed(() => isOwner.value || data.value?.access_role === 'admin')

  async function fetch(org_id: number) {
    isLoading.value = true
    error.value = null

    try {
      data.value = await protocol.send('org/fetch', {org_id})

      isLoading.value = false
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  async function setMemberRole(username: string, role: OrganizationRole) {
    if (!data.value) throw new Error('Организация не загружена')

    await protocol.send('org/members/set_role', {org_id: data.value.id, username, role})
    const member = data.value.members.find(x => x.username == username)
    if (member) {
      member.role = role
    }
  }

  async function kickMember(username: string) {
    if (!data.value) throw new Error('Организация не загружена')

    await protocol.send('org/members/kick', {org_id: data.value.id, username})
    data.value.members = data.value.members.filter(x => x.username != username)
  }

  async function addMembers(usernames: string[]) {
    if (!data.value) throw new Error('Организация не загружена')

    await protocol.send('org/members/add', {org_id: data.value.id, usernames: [...usernames]})

    const newMembers = usernames.map(x => ({username: x, role: 'member'} satisfies OrganizationMember))
    data.value.members.push(...newMembers)
  }

  async function rename(name: string) {
    if (!data.value) throw new Error('Организация не загружена')

    await protocol.send('org/rename', {org_id: data.value.id, name})
    data.value.name = name
  }

  async function leave() {
    if (!data.value) throw new Error('Организация не загружена')

    await protocol.send('org/leave', {org_id: data.value.id})
    data.value = null
  }

  return {
    data, isLoading, error,
    fetch,

    kickMember, setMemberRole, addMembers,

    rename, leave,

    isOwner, isAdmin
  }
})