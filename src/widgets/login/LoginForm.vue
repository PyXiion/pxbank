<script setup lang="ts">

import iconUrl from "@/assets/icon.png";
import {ref} from "vue";

import InputText from 'primevue/inputtext';
import Button from 'primevue/button';


interface Emits {
  submit: [login: string, password: string]
}

const emits = defineEmits<Emits>()

function onClick() {
  emits('submit', username.value!!, password.value!!)
}

const slider = ref(false)
const username = ref<string | null>(null)
const password = ref<string | null>(null)

</script>

<template>
  <div class="flex flex-col gap-3 w-[20em] transition-all ">
    <Transition name="list">
      <div v-if="!slider" class="flex flex-col gap-3">
        <div class="flex flex-col gap-3">
          <div class="field">
            <InputGroup>
              <InputGroupAddon><i class="pi pi-user"></i></InputGroupAddon>
              <InputText
                type="text"
                name="username"
                v-model="username"
                placeholder="Ваш никнейм в Майнкрафт"
                :input-props="{autocomplete:'username'}"
              />
            </InputGroup>
          </div>

          <div class="field">
            <InputGroup>
              <InputGroupAddon><i class="pi pi-lock"></i></InputGroupAddon>
              <InputText
                type="password"
                name="password"
                v-model="password"
                placeholder="Ваш пароль"
                :input-props="{autocomplete:'current-password'}"
                @keyup.enter="onClick"
              />
            </InputGroup>
          </div>
        </div>

        <slot name="error"/>

        <Button class="login" @click="onClick">Войти</Button>

        <p class="opacity-60 text-center cursor-pointer" @click="slider = !slider">Как зарегистрироваться?</p>
      </div>

      <div class="sign-up-info flex flex-col" v-else>
        <h2 class="text-center text-xl mb-3">Регистрация</h2>

        <div class="mb-5 p-4">
          <p class="mb-3">К сожалению, самостоятельная регистрация невозможна.</p>

          <p>Для регистрации и получения доступа к банковской системе обратитесь к одному из работников банка.</p>
        </div>

        <Button severity="contrast" class="mx-auto" @click="slider = !slider">Ладно</Button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>


.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>