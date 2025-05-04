<script setup lang="ts">
import type {OrganizationMember} from "@/types.ts";
import MemberItem from "@/widgets/org/MemberItem.vue";

interface Props {
  members: OrganizationMember[]
}
const {members} = defineProps<Props>()
</script>

<template>
  <div
    v-for="member in members"
    class="border border-black/20 even:border-black/40 panel flex flex-col gap-3 hover:scale-105 transition"
  >
    <MemberItem :data="member"/>
  </div>
</template>

<style scoped>

</style>