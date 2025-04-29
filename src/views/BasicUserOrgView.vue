<script setup lang="ts">

import {computed, useSlots} from "vue";

const slots = useSlots()

const maxWidth = computed(
  () => (800 + 220 * (+!!slots.left + +!!slots.right)).toString() + 'px'
)

</script>

<template>
  <div>
    <div
      class="pt-3 sm:p-3 w-1/1 h-1/1 mx-auto flex flex-col sm:flex-row gap-3"
      :style="{
        maxWidth
      }"
    >
      <aside class="ml-0 min-w-[17em] sm:w-fit sm:max-w-2/7" v-if="!!$slots.left">
        <slot name="left"/>
      </aside>
      <main class="w-1/1 float-right">
        <slot name="center"/>
      </main>
      <aside class="ml-0 min-w-[17em] sm:w-fit sm:max-w-2/7" v-if="!!$slots.right">
        <slot name="right"/>
      </aside>
    </div>

    <slot name="after"/>
  </div>
</template>

<style scoped>

</style>