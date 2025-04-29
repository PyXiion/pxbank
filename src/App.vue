<script setup lang="ts">
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

  <Header v-if="!route.meta.hideHeader"/>
  <MobileSideBar v-if="bp.maxSm"/>
  <RouterView/>


  <GamemodeListener/>
</template>

<style scoped>
</style>
