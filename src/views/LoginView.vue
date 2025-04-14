<script setup lang="ts">
import LoginForm from "@/widgets/login/LoginForm.vue";
import {useUserStore} from "@/stores/userStore.ts";
import {watch} from "vue";
import {useRouter} from "vue-router";
import iconUrl from "@/assets/icon.png";

const userStore = useUserStore()
const router = useRouter()

async function submit(login: string, password: string) {
  await userStore.login(login, password)
  if (userStore.isLoggedIn) {
    window.location.href = `/${userStore.state.user.username}`
  }
}

watch(() => userStore.isLoggedIn, () => {
  if (userStore.isLoggedIn) {
    window.location.href = `/${userStore.state.user.username}`
  }
})

</script>

<template>
  <div
      class="absolute max-sm:w-1/1 max-sm:h-1/1 sm:top-1/2 sm:left-1/2 sm:transform-[translate(-50%,-50%)] panel flex justify-center items-center">
    <div v-if="userStore.state.loading || userStore.hasAuthData">
      Загружаем...
    </div>
    <div v-else>
      <img :src="iconUrl" alt="Ignis Verde logo" class="w-25 mx-auto mb-3">

      <h2 class="text-2xl text-center mb-4">Ignis Verde</h2>
      <h2 class="text-xl text-center mb-4">Добро пожаловать в банк!</h2>

      <LoginForm
          @submit="submit"
          class="w-1/1 h-1/1"
      >
        <template #error>
          <p class="text-red-500 text-center" v-if="userStore.state.error">
            Ошибка. {{ userStore.state.error }}
          </p>
        </template>
      </LoginForm>
    </div>

  </div>
</template>

<style scoped>
</style>