import {defineStore} from "pinia";
import {ref} from "vue";
import {useProtocol} from "@/stores/protocolStore.ts";

export const usePushStore = defineStore('push-notifications', () => {

    const hasPushes = ref(false)
    const canRegister = ref(false)

    async function requestPushes() {
        const {protocol} = useProtocol()
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
            console.error('Браузер отклонил запрос на уведомления')
            return
        }

        const reg = await navigator.serviceWorker.register(new URL('@/workers/push.worker.js', import.meta.url))
        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: await getPublicKey()
        })

        const subId = await protocol.send('push/subscribe', subscription.toJSON())
        localStorage.setItem('push_sub_id', subId)
        hasPushes.value = true
    }

    async function getPublicKey(): Promise<string> {
        const {protocol} = useProtocol()
        return await protocol.send('push/key')
    }

    async function checkSub() {
        const subId = localStorage.getItem('push_sub_id')
        if (!subId || Notification.permission !== 'granted') {
            hasPushes.value = false
            return false
        }
        const {protocol} = useProtocol()

        const v: boolean = await protocol.send('push/is_alive', {id: subId})

        if (!v) {
            localStorage.removeItem('push_sub_id')
        }
        hasPushes.value = v
        return v;
    }

    function checkCanRegister() {
        canRegister.value = 'serviceWorker' in navigator
    }

    checkSub()
    checkCanRegister()

    return {
        hasPushes,
        canRegister,
        requestPushes
    }
})