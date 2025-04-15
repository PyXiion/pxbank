<script lang="ts" setup>
import {ref} from "vue";
import AdminChangePasswordDialog from "@/widgets/admin/AdminChangePasswordDialog.vue";

interface Props {
  username: string
}

defineProps<Props>()

const visible = ref(false);

</script>

<template>
  <AdminChangePasswordDialog v-model:visible="visible" :username="username"/>
  <Button @click="visible = !visible" v-bind="$attrs">
    <slot>Поменять пароль</slot>
  </Button>
</template>

<style scoped>

</style>