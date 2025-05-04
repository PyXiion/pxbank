<script lang="ts" setup>
import {RouterView, useRoute} from 'vue-router'
import Toast from 'primevue/toast';
import Header from "@/Header.vue";
import {useBreakpoints} from "@/widgets/utils/useBreakpoints.ts";
import MobileSideBar from "@/MobileSideBar.vue";
import GamemodeListener from "@/widgets/meme/GamemodeListener.vue";

const route = useRoute()
const bp = useBreakpoints()

</script>

<template>
  <Toast class="max-w-2/3"/>
  <ConfirmDialog/>
  <DynamicDialog/>

  <MobileSideBar v-if="bp.maxSm"/>

  <div class="flex flex-col h-screen">
    <Header v-if="!route.meta.hideHeader"/>
    <main class="flex-1 overflow-auto">
      <RouterView/>
    </main>
  </div>

  <GamemodeListener/>
</template>

<style scoped>
</style>
