import {useToast} from "primevue";

export function useToaster() {
    const toast = useToast()

    function success(summary: string, detail?: string, life: number = 3000) {
        toast.add({
            severity: 'success',
            summary,
            detail,
            life
        })
    }
    function warn(summary: string, detail?: string, life: number = 4000) {
        toast.add({
            severity: 'warn',
            summary,
            detail,
            life
        })
    }
    function info(summary: string, detail?: string, life: number = 3000) {
        toast.add({
            severity: 'info',
            summary,
            detail,
            life
        })
    }
    function error(summary: string, detail?: string, life: number = 6000) {
        toast.add({
            severity: 'error',
            summary,
            detail,
            life
        })
    }

    return {
        success,
        info,
        warn,
        error
    }
}