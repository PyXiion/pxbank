<script setup lang="ts">
import {useUserStore} from "@/stores/userStore.ts";
import {useRoute, useRouter} from "vue-router";
import {ref} from "vue";
import {useBreakpoints} from "@/widgets/utils/useBreakpoints.ts";
import iconUrl from "@/assets/icon.png";
import {usePushStore} from "@/stores/pushStore.ts";
import MobileSideBar from "@/App.vue";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const pushStore = usePushStore()
const bp = useBreakpoints()

const items = ref([
  {route: '', label: 'Маркетплейс (WIP)', icon: 'pi pi-shopping-bag', disabled: true},
  {route: 'home', label: 'Банк', icon: 'pi pi-home'},
  {route: '', label: 'Все транзакции (WIP)', icon: 'pi pi-database', disabled: true},
])

function loginLogoutButton() {
  if (userStore.isLoggedIn) {
    userStore.logout()
  }

  router.push({
    name: 'login'
  })
}

</script>

<template>
  <header class="sticky top-0 z-10">
    <div class="flex rounded-t-none relative max-sm:panel-no-p items-center max-sm:pl-2.5">
      <div id="sidebar-btn"/>
      <Tabs class="mx-auto sm:panel-no-p rounded-t-none! overflow-hidden" :value="route.name?.toString() as any" scrollable>
        <TabList>
          <Tab v-for="tab in items" :key="tab.label" :value="tab.route" :disabled="!!tab.disabled">
            <a class="flex items-center gap-2 text-inherit font-bold" href="">
              <i :class="tab.icon"/>
              <span>{{ tab.label }}</span>
            </a>
          </Tab>
        </TabList>
      </Tabs>

      <div v-if="bp.sm && (!userStore.isLoggedIn || !pushStore.hasPushes && pushStore.canRegister)" class="xl:absolute right-2.5 panel rounded-t-none flex items-center gap-3">
        <div v-if="userStore.isLoggedIn && !pushStore.hasPushes && pushStore.canRegister">
          <Button
              size="small"
              class="h-1/1"
              severity="secondary"
              @click="pushStore.requestPushes()"
          >
            <i class="pi pi-bell"></i>
          </Button>
        </div>

        <Button v-if="!userStore.isLoggedIn" size="small" @click="loginLogoutButton">Войти</Button>
      </div>
    </div>
  </header>
</template>

<style scoped>

</style>