<template>
	<v-snackbar
		id='snackbar'
		v-model='visible'
		app
		:bottom='position.y === "bottom"'
		:color
		:left='position.x === "left"'
		:min-width='mdAndUp?"40vw":"90vw"'
		:right='position.x === "right"'
		:timeout
		:top='position.y === "top"'
	>
		<v-row v-intersect='onIntersect' align='center' class='no-gutters ma-0 pa-0' justify='center'>
			<v-col class='pa-0 ma-0' cols='1'>
				<v-progress-circular
					v-if='loading'
					class=''
					color='white'
					indeterminate
					:size='18'
					:width='3'
				/>
				<v-icon v-if='icon && !loading' class='' :icon medium />
			</v-col>
			<v-col class='pa-0 ma-0 text-center' :class='messageSize' cols='10'>
				{{ message }}
			</v-col>
			<v-col class='pa-0 ma-0' cols='1'>
				<v-icon
					v-if='closable'
					class='ml-2'
					:icon='mdiClose'
					size='small'
					@click='visible = false'
				/>
			</v-col>
		</v-row>
	</v-snackbar>
</template>

<script setup lang='ts'>
import { mdiClose } from '@mdi/js'
import { useDisplay } from 'vuetify'
const { mdAndUp } = useDisplay()

const snackbarStore = snackbarModule()

const closable = computed(() => snackbarStore.closable)
const color = computed(() => snackbarStore.color)
const icon = computed(() => snackbarStore.icon)
const loading = computed(() => snackbarStore.loading)
const message = computed(() => snackbarStore.message)
const messageSize = computed(() => mdAndUp.value ? 'text-body-1' : 'text-body-2')
const position = computed(() => snackbarStore.position)
const timeout = computed(() => snackbarStore.timeout)
const visible = computed({
	get (): boolean {
		return snackbarStore.visible
	},
	set (b: boolean): void {
		snackbarStore.set_visible(b)
	},
})

const isIntersecting = ref(false)

// Calculate if visible, and save into isIntersecting
function onIntersect (is_i: boolean): void {
	isIntersecting.value = is_i
}

watch(isIntersecting, (i: boolean) => {
	if (!i) snackbarStore.$reset()
})
</script>

<style>
#snackbar {
	padding-bottom: 1rem !important;
}
</style>
