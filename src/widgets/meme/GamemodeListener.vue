<script lang="ts" setup>
// @ts-nocheck
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { useToaster } from "@/utils/toaster.ts";
import {animate, utils} from "animejs";

const toaster = useToaster()
const visible = ref(false)
const parent = ref<HTMLDivElement>()

// Команды
type Command = {
  sequence: string
  action: () => void | Promise<void>
}

const commands: Command[] = [
  {
    sequence: "iddqd",
    action: () => {
      const anime = animate('.panel, .panel-no-p, .panel *, .panel-no-p *, header *', {
        y: () => utils.random(-200, 200),
        x: () => utils.random(-200, 200),
        overflow: { to: 'visible' },
        ease: 'inBounce',
        alternate: true,
        autoplay: false,
        skew: () => utils.random(-20, 20),
        rotate: () => utils.random(-25, 25),
        delay: (_, i) => Math.floor(i / 3) * 25,
        onComplete() {
          anime.reverse().then(() => {
            toaster.success('И чойта была!')
          })
        }
      })
      anime.play()
    }
  },
  {
    sequence: "hello",
    action: () => {
      toaster.success("И тебе привет!")
    }
  },
  {
    sequence: "pyxiion",
    action: () => {
      toaster.success("Ну да, это я")
    }
  },
  {
    sequence: "tnt",
    action: () => {
      toaster.error('Бум')
      const anime = animate('.panel, .panel-no-p, .panel *, .panel-no-p *, header *', {
        y: (_, i) => 300 * Math.sin(i * 3.14 / 6 + utils.random(0, 5)),
        x: (_, i) => 300 * Math.cos(i * 3.14 / 6 + utils.random(0, 5)),
        skew: () => utils.random(-20, 20),
        rotate: () => utils.random(-25, 25),
        overflow: { to: 'visible' },
        scale: () => utils.random(1.05, 1.1),
        ease: 'outCubic',
        alternate: true,
        autoplay: false,
        delay: (_, i) => Math.floor(i / 3) * 7,
        onComplete() {
          anime.reverse()
        },
        duration: 900
      })
      anime.play()
    }
  },
]

const states = ref(commands.map(() => 0))

function onKeyDown(event: KeyboardEvent) {
  const key = event.key

  commands.forEach((command, index) => {
    if (command.sequence[states.value[index]] === key.toLowerCase()) {
      states.value[index] += 1
      if (states.value[index] === command.sequence.length) {
        command.action()
        states.value[index] = 0
      }
    } else {
      states.value[index] = 0
    }
  })
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
</template>

<style scoped>
</style>
