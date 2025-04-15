<script lang="ts" setup>
import iconUrl from "@/assets/icon.png";
import {onMounted, ref} from "vue";
import {createTimeline} from "animejs";
import {useBreakpoints} from "@/widgets/utils/useBreakpoints.ts";

const bp = useBreakpoints()

const logo = ref<HTMLElement>()
const logoText = ref<HTMLElement>()
const subLogoText = ref<HTMLElement>()
const details = ref<HTMLElement>()

onMounted(() => {
  createTimeline()
    .add(details.value!, {
      padding: [
        {from: 0, to: 0},
        {from: 0, to: details.value!.style.padding, delay: 1000}
      ],
      height: [
        {from: 0, to: 0},
        {from: 0, to: details.value!.scrollHeight, delay: 1000}
      ],
      onComplete() {
        details.value!.style.height = ''
      }
    })
    .add(logo.value!, {
      x: bp.sm ? [{
        from: 100,
        to: 100,
        duration: 1000
      }, {
        from: 100,
        to: 0
      }] : {},
      scale: {
        from: 5,
        ease: 'outBounce',
        duration: 900
      },
      opacity: {
        from: 0, to: 1,
        duration: 500
      }
    }, 0)
    .add(logoText.value!, {
      opacity: [0, 1],
      scale: [0.7, 1],
      x: {
        from: -70,
        duration: 500
      },
      duration: 300,
      ease: 'inExpo'
    }, 1000)
    .add(subLogoText.value!, {
      opacity: [0, 0.7],
      x: [-30, 0],
      duration: 300
    }, 1500)

})

</script>

<template>
  <div class="slide-away">
    <div
      class="absolute max-sm:w-1/1 max-sm:h-1/1 sm:top-1/2
      sm:left-1/2 sm:transform-[translate(-50%,-50%)] w-[500px] h-[600px] flex flex-col p-10 items-center justify-center"
    >
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:w-[10em] sm:translate-x-5 -mt-30">
        <img ref="logo" :src="iconUrl" alt="Ignis Verde logo" class="verde w-[8em] z-100 sm:bg-neutral-100 sm:dark:bg-neutral-800">

        <div ref="logoText" style="opacity: 0;" class="ml-[1em]">
          <p class="text-5xl font-medium text-nowrap max-sm:text-center">Ignis Verde</p>
          <p ref="subLogoText" class="text-3xl text-nowrap max-sm:text-center" style="opacity: 0;">Банк</p>
        </div>
      </div>

      <div ref="details" class="overflow-hidden shadow-lg mt-10">
        <div class="panel h-1/1">
          <p class="text-center text-2xl mb-5">Добро пожаловать!</p>
          <p class="mb-3 text-center">
            Это банк созданный для сервера Pivoland :D
          </p>
          <p class="text-right">
            Я бананчик
            <img src="/banana-cheerer.gif" alt="banana.gif" class="ml-auto h-[5.5em]"/>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verde {
  box-shadow: 30px 0 30px var(--color-neutral-100);
}
@media (prefers-color-scheme: dark) {
  .verde {
    box-shadow: 20px 0 20px var(--color-neutral-800);
  }
}

</style>