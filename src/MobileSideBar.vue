<script setup lang="ts">
import {ref} from "vue";

const visible = ref(false)
</script>


<template>
  <Teleport defer to="#sidebar-btn">
    <Button @click="visible = true"><i class="pi pi-bars"></i></Button>
  </Teleport>

  <Sidebar
      header="hello"
      position="left"
      v-model:visible="visible"
  >
    hiffffffffffffffff
  </Sidebar>
</template>
