<script lang="ts" setup>
import {ref} from "vue";
import AdminNewUserDialog from "@/widgets/admin/AdminNewUserDialog.vue";

const visible = ref(false);

</script>

<template>
  <AdminNewUserDialog v-model:visible="visible"/>
  <Button @click="visible = !visible" v-bind="$attrs">
    <slot>Новый пользователь</slot>
  </Button>
</template>

<style scoped>

</style>