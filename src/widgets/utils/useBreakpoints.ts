// composables/useBreakpoints.ts
import { ref, computed, reactive, onMounted } from 'vue'

const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const

type BreakpointKey = keyof typeof BREAKPOINTS

const width = ref(typeof window !== 'undefined' ? window.innerWidth : 0)

let ticking = false
const updateWidth = () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            width.value = window.innerWidth
            ticking = false
        })
        ticking = true
    }
}

let isInitialized = false
function initListener() {
    if (isInitialized) return
    window.addEventListener('resize', updateWidth)
    isInitialized = true
}

function createBreakpointHelpers() {
    const helpers = reactive({
        // Basic breakpoints
        sm: computed(() => width.value >= BREAKPOINTS.sm),
        md: computed(() => width.value >= BREAKPOINTS.md),
        lg: computed(() => width.value >= BREAKPOINTS.lg),
        xl: computed(() => width.value >= BREAKPOINTS.xl),
        '2xl': computed(() => width.value >= BREAKPOINTS['2xl']),

        // Max breakpoints
        maxSm: computed(() => width.value < BREAKPOINTS.sm),
        maxMd: computed(() => width.value < BREAKPOINTS.md),
        maxLg: computed(() => width.value < BREAKPOINTS.lg),
        maxXl: computed(() => width.value < BREAKPOINTS.xl),
        max2xl: computed(() => width.value < BREAKPOINTS['2xl']),

        // Only breakpoints
        onlySm: computed(() => width.value >= BREAKPOINTS.sm && width.value < BREAKPOINTS.md),
        onlyMd: computed(() => width.value >= BREAKPOINTS.md && width.value < BREAKPOINTS.lg),
        onlyLg: computed(() => width.value >= BREAKPOINTS.lg && width.value < BREAKPOINTS.xl),
        onlyXl: computed(() => width.value >= BREAKPOINTS.xl && width.value < BREAKPOINTS['2xl']),
        only2xl: computed(() => width.value >= BREAKPOINTS['2xl']),

        // Range breakpoints (sm_xl, lg_2xl, etc.)
        sm_md: computed(() => width.value >= BREAKPOINTS.sm && width.value < BREAKPOINTS.lg),
        sm_lg: computed(() => width.value >= BREAKPOINTS.sm && width.value < BREAKPOINTS.xl),
        sm_xl: computed(() => width.value >= BREAKPOINTS.sm && width.value < BREAKPOINTS['2xl']),
        sm_2xl: computed(() => width.value >= BREAKPOINTS.sm),

        md_lg: computed(() => width.value >= BREAKPOINTS.md && width.value < BREAKPOINTS.xl),
        md_xl: computed(() => width.value >= BREAKPOINTS.md && width.value < BREAKPOINTS['2xl']),
        md_2xl: computed(() => width.value >= BREAKPOINTS.md),

        lg_xl: computed(() => width.value >= BREAKPOINTS.lg && width.value < BREAKPOINTS['2xl']),
        lg_2xl: computed(() => width.value >= BREAKPOINTS.lg),

        xl_2xl: computed(() => width.value >= BREAKPOINTS.xl && width.value < BREAKPOINTS['2xl']),

        between(min: BreakpointKey, max: BreakpointKey) {
            return computed(() => {
                const minWidth = BREAKPOINTS[min]
                const maxWidth = BREAKPOINTS[max]
                return width.value >= minWidth && (max === '2xl' ? true : width.value < maxWidth)
            })
        },
        only (key: BreakpointKey) {
            return computed(() => {
                const current = BREAKPOINTS[key]
                const next = Object.values(BREAKPOINTS).find(bp => bp > current) || Infinity
                return width.value >= current && width.value < next
            })
        },
    })

    return helpers
}

const sharedBreakpoints = createBreakpointHelpers()

export function useBreakpoints() {
    onMounted(() => {
        initListener()
    })

    return sharedBreakpoints
}