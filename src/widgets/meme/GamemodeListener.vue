<script lang="ts" setup>

import {nextTick, onMounted, onUnmounted, ref} from "vue";
import {useToaster} from "@/utils/toaster.ts";
import {useToast} from "primevue";

const sequence = "gamemode"
const state = ref(0)
const visible = ref(false)
const parent = ref<HTMLDivElement>()
const toaster = useToaster()

async function trigger() {
  toaster.success('Включен креатив!')
  return

  const {animate, utils, createSpring} = await import('animejs')
  visible.value = true

  await nextTick()

  animate(parent.value!.children, {
    left: [
      {
        from: () => `+=${utils.random(-250, 250)}`,
        to: '-=300',
        duration: 3500
      }
    ],
    top: [
      {
        to: 300,
        duration: 3500
      }
    ],
    rotate: {
      from: () => `+=${utils.random(-30, 30)}`
    },
    opacity: {
      to: 0,
      ease: 'inExpo'
    },
    duration: 3000
  })
}

function onKeyDown(event: KeyboardEvent) {
  const key = event.key
  if (sequence[state.value] == key) {
    state.value += 1

    if (state.value == sequence.length) {
      trigger()
      state.value = 0
    }
  } else {
    state.value = 0
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})

</script>

<template>
  <div v-if="visible" ref="parent" class="fill-red-600">
    <template v-for="_ in 10">
      <svg class="w-10 heart-meme absolute left-1/2 top-0" style="enable-background:new 0 0 122.88 107.41"
           viewBox="0 0 122.88 107.41" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"
           y="0px">
        <g>
          <path class="st0"
                d="M60.83,17.19C68.84,8.84,74.45,1.62,86.79,0.21c23.17-2.66,44.48,21.06,32.78,44.41 c-3.33,6.65-10.11,14.56-17.61,22.32c-8.23,8.52-17.34,16.87-23.72,23.2l-17.4,17.26L46.46,93.56C29.16,76.9,0.95,55.93,0.02,29.95 C-0.63,11.75,13.73,0.09,30.25,0.3C45.01,0.5,51.22,7.84,60.83,17.19L60.83,17.19L60.83,17.19z"/>
        </g>
      </svg>
    </template>
  </div>
</template>

<style scoped>

</style>