<script lang="ts" setup>

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
                v-model="username"
                :input-props="{autocomplete:'username'}"
                name="username"
                placeholder="Ваш никнейм в Майнкрафт"
                type="text"
              />
            </InputGroup>
          </div>

          <div class="field">
            <InputGroup>
              <InputGroupAddon><i class="pi pi-lock"></i></InputGroupAddon>
              <InputText
                v-model="password"
                :input-props="{autocomplete:'current-password'}"
                name="password"
                placeholder="Ваш пароль"
                type="password"
                @keyup.enter="onClick"
              />
            </InputGroup>
          </div>
        </div>

        <slot name="error"/>

        <Button class="login" @click="onClick">Войти</Button>

        <p class="opacity-60 text-center cursor-pointer" @click="slider = !slider">Как зарегистрироваться?</p>
      </div>

      <div v-else class="sign-up-info flex flex-col">
        <h2 class="text-center text-xl mb-3">Регистрация</h2>

        <div class="mb-5 p-4">
          <p class="mb-3">К сожалению, самостоятельная регистрация невозможна.</p>

          <p>Для регистрации и получения доступа к банковской системе обратитесь к одному из работников банка.</p>
        </div>

        <Button class="mx-auto" severity="contrast" @click="slider = !slider">Ладно</Button>
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