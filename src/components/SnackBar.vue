<template>
	<v-snackbar
		v-model='visible'
		app
		:bottom='position.y === "bottom"'
		:color='color'
		:left='position.x === "left"'
		:right='position.x === "right"'
		:timeout='timeout'
		:top='position.y === "top"'
	>
		<v-row v-intersect='onIntersect' justify='center' align='center' class='no-gutters ma-0 pa-0'>
			<v-col cols='auto' class='pa-0 mr-2' v-if='loading'>
				<v-progress-circular
					indeterminate
					:width='3'
					:size='18'
					color='white'
					class='mr-1'
				/>
			</v-col>
			<v-col
				v-if='icon && isDesktop && !loading'
				cols='auto'
				class='pa-0'
			>
				<v-icon medium class='mr-2' :icon='icon' />
			</v-col>
			<v-col cols='auto' class='pa-0'>
				<div class='text-center' :class='messageSize'>{{ message }}</div>
			</v-col>
			<v-col
				v-if='closable && isDesktop'
				cols='auto'
				class='pa-0'
			>
				<v-icon
					@click='visible = false'
					class='ml-2'
					size='small'
					:icon='mdiClose'
				/>
			</v-col>
		</v-row>
	</v-snackbar>
</template>

<script setup lang='ts'>
import { mdiClose } from '@mdi/js';
import type { nu, su, TSnackPosition } from '@/types';
import { useDisplay } from 'vuetify';
const { mdAndUp } = useDisplay();

const snackbarStore = snackbarModule();

const closable = computed((): boolean => {
	return snackbarStore.closable;
});
const color = computed((): su => {
	return snackbarStore.color;
});
const icon = computed((): su => {
	return snackbarStore.icon;
});
const isDesktop = computed((): boolean => {
	return mdAndUp.value;
});
const loading = computed((): boolean => {
	return snackbarStore.loading;
});
const message = computed((): su => {
	return snackbarStore.message;
});
const messageSize = computed((): string => {
	return mdAndUp.value ? 'text-body-1' : 'text-body-2';
});
const position = computed((): TSnackPosition => {
	return snackbarStore.position;
});
const timeout = computed((): nu => {
	return snackbarStore.timeout;
});
const visible = computed({
	get (): boolean {
		return snackbarStore.visible;
	},
	set (b: boolean): void {
		snackbarStore.set_visible(b);
	}
});

const isIntersecting = ref(false);

/**
** Calculate if visible, and save into this.isIntersecting
*/
const onIntersect = (is_i: boolean, _entries: Array<IntersectionObserverEntry>, _observer: IntersectionObserver): void => {
	isIntersecting.value = is_i;
};

watch(isIntersecting, (i) => {
	if (!i) snackbarStore.$reset();
}
);
</script>
