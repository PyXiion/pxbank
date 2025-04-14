import {defineStore} from "pinia";
import {ref} from "vue";
import type {Currency} from "@/types.ts";
import {useProtocol} from "@/stores/protocolStore.ts";

export const useCurrencyStore = defineStore('currency', () => {
   const currencies = ref<{[id: number]: Currency}>({});

   const {protocol} = useProtocol();

   function getCurrencyIcon(currencyId: number) {
      // if (currencyId in currencies.value) {
      //    return currencies.value[currencyId];
      // }

      return null;
   }

   async function fetchCurrencies() {
      const response = await protocol.send("currencies/fetch");
      currencies.value = response.currencies
   }

   fetchCurrencies()

   return {
      fetchCurrencies,
      getCurrencyIcon
   }
});