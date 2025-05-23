<template>
	<v-snackbar v-model='visible' id='snackbar' app :bottom='position.y === "bottom"' :color='color'
		:left='position.x === "left"' :right='position.x === "right"' :timeout='timeout' :top='position.y === "top"'
		:min-width='mdAndUp?"40vw":"90vw"'
	>
		<v-row v-intersect='onIntersect' justify='center' align='center' class='no-gutters ma-0 pa-0'>
			<v-col cols='1' class='pa-0 ma-0'>
				<v-progress-circular v-if='loading' indeterminate :width='3' :size='18' color='white' class='' />
				<v-icon v-if='icon && !loading' medium class='' :icon='icon' />
			</v-col>
			<v-col cols='10' class='pa-0 ma-0 text-center' :class='messageSize'>
				{{ message }}
			</v-col>
			<v-col cols='1' class='pa-0 ma-0'>
				<v-icon  v-if='closable' @click='visible = false' class='ml-2' size='small' :icon='mdiClose' />
			</v-col>
		</v-row>
	</v-snackbar>
</template>

<script setup lang='ts'>
import { mdiClose } from '@mdi/js';
import { useDisplay } from 'vuetify';
const { mdAndUp } = useDisplay();

const snackbarStore = snackbarModule();

const closable = computed(() => snackbarStore.closable);
const color = computed(() => snackbarStore.color);
const icon = computed(() => snackbarStore.icon);
const loading = computed(() => snackbarStore.loading);
const message = computed(() => snackbarStore.message);
const messageSize = computed(() => mdAndUp.value ? 'text-body-1' : 'text-body-2');
const position = computed(() => snackbarStore.position);
const timeout = computed(() => snackbarStore.timeout);
const visible = computed({
	get (): boolean {
		return snackbarStore.visible;
	},
	set (b: boolean): void {
		snackbarStore.set_visible(b);
	}
});

const isIntersecting = ref(false);

/// Calculate if visible, and save into isIntersecting
const onIntersect = (is_i: boolean, _entries: Array<IntersectionObserverEntry>, _observer: IntersectionObserver): void => {
	isIntersecting.value = is_i;
};

watch(isIntersecting, (i) => {
	if (!i) snackbarStore.$reset();
});
</script>

<style>
#snackbar {
	padding-bottom: 1rem !important;
}
</style>
