<script lang="ts" setup>
import {useOrganizationListStore} from "@/stores/organizationStore.ts";
import {computed, onMounted} from "vue";
import BasicUserOrgView from "@/views/BasicUserOrgView.vue";
import OrganizationListItem from "@/widgets/org/OrganizationListItem.vue";
import {useUserStore} from "@/stores/userStore.ts";
import {useDialog} from "primevue";
import CreateOrganizationDialog from "@/widgets/org/dialogs/CreateOrganizationDialog.vue";

const dialog = useDialog()
const userStore = useUserStore()
const orgListStore = useOrganizationListStore()

onMounted(() => {
  orgListStore.fetch()
})

const orgCount = computed(() => userStore.state.user.orgCount)
const orgLimit = computed(() => userStore.state.user.orgLimit)

function createOrg() {
  dialog.open(CreateOrganizationDialog)
}

</script>

<template>
  <BasicUserOrgView>
    <template #center>
      <div class="panel mb-4">
        <h2 class="text-center text-2xl">Список ваших организаций</h2>
      </div>

      <div v-if="orgListStore.isLoading" class="text-center">
        Загрузка...
      </div>
      <div v-else-if="orgListStore.error" class="error-panel">
        Ошибка: {{ orgListStore.error?.message ?? orgListStore.error.toString() }}
      </div>
      <div v-else-if="orgListStore.data.length > 0" class="space-y-3">
        <OrganizationListItem
          v-for="org in orgListStore.data"
          :data="org"/>
      </div>
      <div v-else class="panel space-y-1 w-2/3 mx-auto p-4">
        <p class="text-center text-[1.1em]">Вы не состоите в каких-либо организациях.</p>
        <p>Чтобы создать организацию нажмите по кнопке справа.</p>
        <p>Чтобы вспупить в организацию, попросите администратора какой-либо организации вас в неё добавить.</p>
      </div>
    </template>
    <template #right>
      <div class="panel space-y-3">
        <Button
          :disabled="orgLimit == 0 || orgCount >= orgLimit"
          class="w-1/1"
          @click="createOrg"
        >
          Создать организацию
        </Button>

        <div v-if="orgLimit == 0 || orgCount >= orgLimit" class="space-y-3">
          <div class="error-panel">
            Вы не можете создавать организации.

          </div>
          <template v-if="orgLimit > 0 && orgCount >= orgLimit">
            <p>Вы создали максимально возможное количество организаций ({{ orgLimit }}).</p>
            <p>Увеличение лимита возможно в индивидуальном порядке.</p>
          </template>
        </div>
        <div v-else class="text-center">
          Лимит: {{ orgCount }}/{{ orgLimit }}
        </div>
      </div>
    </template>
  </BasicUserOrgView>
</template>

<style scoped>

</style>