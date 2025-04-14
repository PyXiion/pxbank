import {defineStore} from "pinia";
import {PxProtocol} from "@/api/protocol.ts";
import {useToast} from "primevue";
import {reactive, ref} from "vue";

export const useProtocol = defineStore('pxproto', () => {
    const protocol = reactive(new PxProtocol());
    const toast = useToast()

    protocol.addEventListener('toast', (data) => {
        toast.add(data.data)
    })

    return {
        protocol: protocol as PxProtocol
    }
})