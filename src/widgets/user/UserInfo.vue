<script setup lang="ts">
import Avatar from "@/widgets/utils/Avatar.vue"
import {useUserStore} from "@/stores/userStore.ts";

interface Props {
  username: string
}

const props = defineProps<Props>()

const userStore = useUserStore()

</script>

<template>
  <div class="user-info">
    <div class="flex gap-2">
      <Avatar :name="username" size="32px"/>
      <div class="ml">
        <h3 class="text-[22px] font-[Minecraft]">{{ username }}</h3>
      </div>

      <div v-if="userStore.isAdmin">
        <!--      TODO -->
      </div>
    </div>

  </div>
</template>

<style scoped>

</style>