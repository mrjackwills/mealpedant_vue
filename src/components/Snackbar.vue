<template>
	<v-snackbar
		v-model='visible'
		:bottom='position.y === "bottom"'
		:color='color'
		:left='position.x === "left"'
		:right='position.x === "right"'
		:timeout='timeout'
		:top='position.y === "top"'
		app
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
				<v-icon medium class='mr-2'>{{ icon }}</v-icon>
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
					small
				>
					{{ mdiClose }}
				</v-icon>
			</v-col>
		</v-row>
	</v-snackbar>
</template>

<script lang='ts'>
import { mapStores } from 'pinia';
import { mdiClose } from '@mdi/js';
import { nu, su, TSnackPosition } from '@/types';
import { snackbarModule, } from '@/store';
import Vue from 'vue';

export default Vue.extend({
	name: 'snackbar-component',

	computed: {
		...mapStores(snackbarModule),

		closable (): boolean {
			return this.snackbarStore.closable;
		},
		color (): su {
			return this.snackbarStore.color;
		},
		icon (): su {
			return this.snackbarStore.icon;
		},
		isDesktop (): boolean {
			return this.$vuetify.breakpoint.mdAndUp;
		},
		loading (): boolean {
			return this.snackbarStore.loading;
		},
		message (): su {
			return this.snackbarStore.message;
		},
		messageSize (): string {
			return this.$vuetify.breakpoint.mdAndUp ? 'text-body-1' : 'text-body-2';
		},
		position (): TSnackPosition {
			return this.snackbarStore.position;
		},
		timeout (): nu {
			return this.snackbarStore.timeout;
		},
		visible: {
			get (): boolean {
				return this.snackbarStore.visible;
			},
			set (b: boolean): void {
				this.snackbarStore.set_visible(b);
			}
		}
	},

	data: () => ({
		isIntersecting: false,
		mdiClose,
	}),

	methods: {
		/**
		 ** Calculate if visible, and save into this.isIntersecting
		 */
		onIntersect (entries: Array<IntersectionObserverEntry>, _observer: IntersectionObserver): void {
			this.isIntersecting = !!entries[0]?.isIntersecting;
		},
	},

	watch: {
		/**
		 ** Reset snackbar values when !isIntersecting
		 */
		isIntersecting (i): void {
			if (!i) this.snackbarStore.$reset();
		}
	}
});
</script>