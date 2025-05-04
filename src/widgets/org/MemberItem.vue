<script lang="ts" setup>
import type {OrganizationMember} from "@/types.ts";
import Avatar from "@/widgets/utils/Avatar.vue";
import {useUserStore} from "@/stores/userStore.ts";
import {useOrganizationStore} from "@/stores/organizationStore.ts";
import MemberControlPopup from "@/widgets/org/MemberControlPopup.vue";

interface Props {
  data: OrganizationMember
}

const {data} = defineProps<Props>()

const role2text = {
  'owner': 'владелец',
  'admin': 'админ',
  'member': undefined
}

const userStore = useUserStore()
const orgStore = useOrganizationStore()

</script>

<template>
  <div class="flex gap-1">
    <Avatar :name="data.username" class="mr-1"/>

    <span class="font-[Minecraft]">{{ data.username }}</span>
    <span v-if="role2text[data.role]" class="opacity-40">{{ role2text[data.role] }}</span>
    <span v-if="data.username === userStore.state.user.username" class="opacity-40">(ВЫ)</span>

    <div v-if="orgStore.isAdmin && data.role !== 'owner' && data.username !== userStore.state.user.username" class="ml-auto">
      <MemberControlPopup :member="data"/>
    </div>
  </div>
</template>

<style scoped>

</style>