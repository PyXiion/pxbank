// src/components/Header.vue
<script lang="ts" setup>
import {useUserStore} from "@/stores/userStore.ts";
import {useRoute, useRouter} from "vue-router";
import {computed, ref, watch, onMounted, type Ref} from "vue";
import {useBreakpoints} from "@/widgets/utils/useBreakpoints.ts";
import {usePushStore} from "@/stores/pushStore.ts";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const pushStore = usePushStore()
const bp = useBreakpoints()

interface TabInfo {
  name: string
  label: string
  icon: string
  disabled?: boolean
  params?: () => Record<string, any>
}

const items = ref<TabInfo[]>([
  {
    name: 'bank',
    label: 'Банк',
    icon: 'pi pi-credit-card',
    params: () => ({ username: userStore.state.user.username })
  },
  {
    name: 'orgList',
    label: 'Организации',
    icon: 'pi pi-building'
  },
  { name: 'map', label: 'Карта (WIP)', icon: 'pi pi-globe' },
  { name: 'marketplace', label: 'Маркетплейс (WIP)', icon: 'pi pi-shopping-bag', disabled: true },
])

const selectedTab = ref<string>(route.path)

onMounted(() => {
  updateSelectedTab()
})

watch(() => route.path, () => {
  updateSelectedTab()
})

function updateSelectedTab() {
  const match = items.value.find(tab => tab.name === route.name)
  selectedTab.value = match?.name ?? ''
}

function loginLogoutButton() {
  if (userStore.isLoggedIn) {
    userStore.logout()
  }
  router.push({ name: 'login' })
}

function onTabClick(tab: TabInfo) {
  selectedTab.value = tab.name
  router.push({
    name: tab.name,
    params: tab.params ? tab.params() : undefined
  })
}
</script>

<template>
  <header class="sticky top-0 z-10">
    <div class="flex rounded-t-none relative max-sm:panel-no-p items-center max-sm:pl-2.5">
      <div id="sidebar-btn" />
      <Tabs
        v-model:value="selectedTab"
        class="mx-auto sm:panel-no-p rounded-t-none! overflow-hidden"
        scrollable
      >
        <TabList>
          <Tab
            v-for="tab in items"
            :key="tab.label"
            :disabled="!!tab.disabled"
            :value="tab.name"
            @click="onTabClick(tab)"
          >
            <a class="flex items-center gap-2 text-inherit font-bold">
              <i :class="tab.icon"/>
              <span v-html="tab.label"></span>
            </a>
          </Tab>
        </TabList>
      </Tabs>

      <div v-if="bp.sm && (!userStore.isLoggedIn || (!pushStore.hasPushes && pushStore.canRegister))"
           class="xl:absolute right-2.5 panel rounded-t-none flex items-center gap-3">
        <div v-if="userStore.isLoggedIn && !pushStore.hasPushes && pushStore.canRegister">
          <Button
            class="h-1/1"
            severity="secondary"
            size="small"
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