<script lang="ts" setup>
import type {OrganizationShortInfo} from "@/types.ts";
import {computed} from "vue";
import {useRouter} from "vue-router";

interface Props {
  data: OrganizationShortInfo
}

const props = defineProps<Props>()

const router = useRouter()

const canInvite = computed(() => ['admin', 'owner'].includes(props.data.access_role!))

function goto() {
  router.push({
    name: 'org',
    params: {
      orgId: props.data.id
    }
  })
}

</script>

<template>
  <div class="panel flex transition hover:scale-101 cursor-pointer" @click="goto">
    <div class="mr-auto">
      <h1 class="text-3xl">{{ data.name }}</h1>
      <p>
        Участников:
        <span class="text-[1.1em]">{{ data.member_count ?? 1 }}/{{ data.member_limit }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>