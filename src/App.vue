<script setup lang="ts">
import {RouterView, useRoute} from 'vue-router'
import Toast from 'primevue/toast';
import Header from "@/Header.vue";
import {useBreakpoints} from "@/widgets/utils/useBreakpoints.ts";
import MobileSideBar from "@/MobileSideBar.vue";

const route = useRoute()
const bp = useBreakpoints()

</script>

<template>
  <Header v-if="!route.meta.hideHeader"/>
  <MobileSideBar v-if="bp.maxSm"/>
  <RouterView/>


  <Toast class="max-w-2/3"/>
</template>

<style scoped>
</style>
