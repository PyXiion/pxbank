<script setup lang="ts">
import TransactionHistory from "@/widgets/transactions/TransactionHistory.vue";
import {useUserStore} from "@/stores/userStore.ts";
import {computed} from "vue";
import {useRoute, useRouter} from "vue-router";
import AccountListWidget from "@/widgets/accounts/AccountListWidget.vue";
import TransferButtonWidget from "@/widgets/operations/TransferButton.vue";
import UserInfo from "@/widgets/user/UserInfo.vue";
import {useBreakpoints} from "@/widgets/utils/useBreakpoints.ts";
import iconUrl from "@/assets/icon.png";
import AdminChangePasswordButton from "@/widgets/admin/AdminChangePasswordButton.vue";
import ChangePasswordButton from "@/widgets/user/ChangePasswordButton.vue";
import AdminNewUserButton from "@/widgets/admin/AdminNewUserButton.vue";

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const bp = useBreakpoints()

const username = computed(() => route.params.username as string)
const isOwn = computed(() => userStore.isLoggedIn && username.value == userStore.state.user.username)
const canManagePage = computed(() => isOwn.value || userStore.state.user.isAdmin)

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
  <div>
    <div class="max-w-[1020px] pt-3 sm:p-3 w-1/1 h-1/1 mx-auto flex flex-col sm:flex-row gap-3">
      <aside class="ml-0 min-w-12/50 w-fit max-w-2/7">
        <section class="panel text-2xl font-bold flex items-center mb-3 justify-center">
          <img :src="iconUrl" alt="Ignis Verde logo" class="h-8 mr-3">
          <span>Ignis Verde</span>
        </section>
        <section id="user-info" class="panel mb-3 flex flex-col gap-3">
          <UserInfo :username="username" />

          <div class="flex gap-3 flex-wrap" v-if="isOwn">
            <ChangePasswordButton size="small"  class="h-8"/>
            <Button severity="secondary" size="small" class="h-8" @click="loginLogoutButton">
              Выйти
            </Button>
          </div>
        </section>

        <section v-if="isOwn || userStore.isAdmin">
          <AccountListWidget :username="username"/>
        </section>
      </aside>
      <main class="w-1/1 float-right">
        <div class="flex flex-col gap-3">
          <section class="panel flex gap-unit flex-col gap-3" v-if="canManagePage">
            <div>
              <p class="section-name">Финансовые операции</p>
            </div>

            <div class="flex flex-col md:flex-row gap-3">
              <TransferButtonWidget :username="username" type="number"/>
              <TransferButtonWidget :username="username" type="id"/>
            </div>

            <div class="flex flex-col md:flex-row gap-3">
              <Button class="w-1/1" severity="secondary" disabled>Взять кредит</Button>
              <Button class="w-1/1" severity="secondary" disabled>Сделать вклад</Button>
            </div>

            <div v-if="userStore.isAdmin">
              <p class="section-name mb-3"><i class="pi pi-wrench"/> Админка <i class="pi pi-wrench"/></p>

              <div class="flex gap-3">
                <AdminNewUserButton/>
                <AdminChangePasswordButton :username="username"/>
              </div>
            </div>

          </section>

          <Teleport defer to="#transaction-mobile" :disabled="bp.md">
            <TransactionHistory :username="username"/>
          </Teleport>
        </div>
      </main>
    </div>

    <div id="transaction-mobile" class="mt-3"></div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.section-name {
  @apply text-xl text-center;
}
</style>