<script setup lang="ts">
import BasicUserOrgView from "@/views/BasicUserOrgView.vue";
import MapWidget from "@/widgets/map/MapWidget.vue";
import {onMounted, ref} from "vue";
import {useToaster} from "@/utils/toaster.ts";

const mapContainer = ref<HTMLDivElement>()
const mapSizes = ref([0, 0])
const toast = useToaster()

onMounted(() => {
  const observer = new ResizeObserver(() => {
    mapSizes.value = [
      mapContainer.value!.clientWidth,
      mapContainer.value!.clientHeight
    ]
  })
  observer.observe(mapContainer.value!)
})

function close() {
  document.documentElement.childNodes.forEach((x) => x.remove())
}

</script>

<template>
  <div class="flex gap-3 p-3 h-1/1">
    <div ref="mapContainer" class="flex-1 bg-gray-200 overflow-hidden rounded-xl">
      <MapWidget :width="mapSizes[0]" :height="mapSizes[1]"/>
    </div>
    <div class="basis-[400px] panel flex flex-col gap-2">
      <h2 class="text-xl">Просто тестовая карта (эксперимент)</h2>
      <p>Тут нифига кроме карты нет.</p>

      <h2 class="text-xl">Что может появиться?</h2>
      <ul class="list-disc pl-[2em]">
        <li>Точки интереса (магазины, здания, ПВЗ и пр.);</li>
        <li>Отзывы к этим точкам интереса (звёздочки);</li>
        <li>Разметка зон (спавн, частные и пр.);</li>
        <li>Временные надписи. Типа: "что за нехороший человек построил тут унитаз".</li>
      </ul>

      <p>Закладок не будет.</p>

      <Button class="mt-auto" @click="toast.info('Жмяк')">Сделать хорошо</Button>
      <Button severity="info" @click="toast.info('Жмяк')">Отключить кислород</Button>
      <Button severity="warn" @click="toast.info('Жмяк')">Сделать плохо</Button>
      <Button severity="danger" @click="toast.info('Жмяк')">Бахнуть ядерку</Button>
      <Button severity="secondary" @click="toast.info('Жмяк')">Выпустить &#x41d;&#x31a;&#x33e;&#x30e;&#x311;&#x31a;&#x311;&#x30c;&#x352;&#x31a;&#x304;&#x34a;&#x34b;&#x357;&#x313;&#x313;&#x341;&#x343;&#x350;&#x341;&#x302;&#x31a;&#x35d;&#x360;&#x311;&#x352;&#x31b;&#x340;&#x33f;&#x307;&#x30f;&#x30c;&#x30b;&#x360;&#x305;&#x346;&#x302;&#x35b;&#x31b;&#x30e;&#x33d;&#x344;&#x305;&#x357;&#x302;&#x33a;&#x356;&#x32f;&#x330;&#x34e;&#x316;&#x32d;&#x330;&#x32b;&#x32c;&#x33c;&#x35c;&#x323;&#x32c;&#x331;&#x325;&#x356;&#x31f;&#x319;&#x349;&#x319;&#x32a;&#x321;&#x35a;&#x31c;&#x332;&#x325;&#x321;&#x415;&#x311;&#x308;&#x310;&#x301;&#x34c;&#x342;&#x303;&#x33b;&#x356;&#x31d;&#x316;&#x35c;&#x330;&#x322;&#x329;&#x34e;&#x32a;&#x349;&#x339;&#x333;&#x324;&#x31e;&#x33c;&#x32d;&#x427;&#x30b;&#x35b;&#x312;&#x34a;&#x30a;&#x305;&#x30d;&#x322;&#x356;&#x322;&#x31e;&#x354;&#x355;&#x34d;&#x326;&#x35a;&#x320;&#x317;&#x329;&#x32c;&#x32a;&#x35a;&#x33a;&#x325;&#x32e;&#x319;&#x34e;&#x348;&#x31d;&#x318;&#x348;&#x34e;&#x31d;&#x32e;&#x32b;&#x345;&#x35c;&#x31d;&#x339;&#x32e;&#x356;&#x422;&#x303;&#x304;&#x34c;&#x308;&#x35d;&#x30a;&#x341;&#x346;&#x314;&#x344;&#x341;&#x31a;&#x342;&#x33d;&#x307;&#x34a;&#x30a;&#x303;&#x360;&#x30b;&#x301;&#x30c;&#x302;&#x351;&#x357;&#x30d;&#x30c;&#x30c;&#x357;&#x350;&#x33e;&#x35d;&#x32f;&#x333;&#x34d;&#x348;&#x33c;&#x326;&#x347;&#x318;&#x331;&#x317;&#x32b;&#x32a;&#x354;&#x35c;&#x32b;&#x332;&#x348;&#x32b;&#x322;&#x323;&#x354;&#x330;&#x317;&#x316;&#x333;&#x326;&#x320;&#x320;&#x34e;&#x348;&#x333;&#x348;&#x329;&#x32e;&#x321;&#x327;&#x324;&#x31c;&#x333;&#x41e;&#x31b;&#x309;&#x34c;&#x31a;&#x302;&#x31a;&#x35d;&#x30d;&#x307;&#x350;&#x346;&#x360;&#x343;&#x30a;&#x35d;&#x313;&#x33e;&#x34b;&#x34c;&#x306;&#x312;&#x30d;&#x350;&#x312;&#x30f;&#x301;&#x31b;&#x358;&#x304;&#x30c;&#x350;&#x352;&#x360;&#x30b;&#x34a;&#x33e;&#x309;&#x300;&#x342;&#x311;&#x312;&#x33f;&#x343;&#x321;&#x34e;&#x327;&#x321;&#x32f;&#x332;&#x326;&#x317;&#x34e;&#x34e;</Button>
      <Button severity="contrast" @click="close">Закрыть</Button>
    </div>

  </div>
</template>

<style scoped>

</style>