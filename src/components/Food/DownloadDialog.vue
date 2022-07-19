<template>
	<div class='text-center'>
		<v-dialog
			v-model='dialog'
			eager
			max-width='650'
			with='100%'
		>
			<v-card>
				<v-img
					:src='imgSource'
					alt='A photograph of a meal'
					class='grey darken-4'
					:max-height='windowHeight'
					contain
				>
				</v-img>
				<v-card-actions>
					<v-row justify='space-between' class='no-gutters'>
						<v-col cols='auto' class='pa-0' v-for='(item ,index) in buttonFields' :key='index'>
							<v-btn
								@click.stop='click(item.click)'
								:color='textColor'
								:class='textColorClass'
								text
							>
								<v-progress-circular
									v-if='localLoading && index === 0'
									:size='spinnerSize'
									:width='spinnerWidth'
									class='mr-2'
									indeterminate
									small
								/>
								<v-icon v-if='!localLoading && index === 0' class='rotated mr-2' style='vertical-align: middle' :large='$vuetify.breakpoint.lgAndUp' :small='$vuetify.breakpoint.mdAndDown'>
									{{ item.icon }}
								</v-icon>
								<span class='text-subtitle-1' :class='{"text-caption" : $vuetify.breakpoint.mdAndDown}'>{{ item.text }} </span>
								<v-icon v-if='!localLoading && index === 1' class='ml-2' style='vertical-align: middle' :large='$vuetify.breakpoint.lgAndUp' :small='$vuetify.breakpoint.mdAndDown'>
									{{ item.icon }}
								</v-icon>
							</v-btn>
						</v-col>
					</v-row>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script lang='ts'>
import { axios_downloadPhoto } from '@/services/axios';
import { env } from '@/vanillaTS/env';
import { foodModule, loadingModule } from '@/store';
import { mdiPublish, mdiClose } from '@mdi/js';
import { su, TPerson, u } from '@/types';
import Vue from 'vue';

export default Vue.extend({
	name: 'download-dialog-component',

	computed: {
		
		dialog: {
			get: function (): boolean {
				return foodModule().dialog;
			},
			set: function (b: boolean): void {
				foodModule().set_dialog(b);
			}
		},
		imgSource (): string {
			return `${env.domain_static}${this.photoUrlConverted}`;
		},
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		photoDate (): su {
			return foodModule().photo_date;
		},
		photoPerson (): u<TPerson> {
			return foodModule().photo_person;
		},
		photoUrlConverted (): su {
			return foodModule().photo_url_converted;
		},
		photoUrlOriginal (): su {
			return foodModule().photo_url_original;
		},
		spinnerSize (): string {
			return this.$vuetify.breakpoint.mdAndDown ? '16' : '32';
		},
		spinnerWidth (): string {
			return this.$vuetify.breakpoint.mdAndDown ? '2' : '4';
		},
		textColor (): string {
			return this.photoPerson ==='Dave' ? 'primary': 'secondary';
		},
		textColorClass (): string {
			return this.textColor === 'primary' ? 'black--text' : '';
		},
		windowHeight (): number {
			return window.innerHeight * .70;
		},
	},

	data: () => ({
		buttonFields: [
			{
				text: ' original',
				icon: mdiPublish,
				click: 'downloadOriginalFromStatic' as const
			},
			{
				text: 'close',
				icon: mdiClose,
				click: 'closeDialog' as const
			}
		],
		localLoading: false,
	}),

	methods: {
		click (x: 'closeDialog' | 'downloadOriginalFromStatic'): void {
			switch (x) {
			case 'closeDialog':
				this.closeDialog();
				break;
			case 'downloadOriginalFromStatic':
				this.downloadOriginalFromStatic();
				break;
			}
		},

		closeDialog (): void {
			this.dialog = false;
			this.localLoading = false;
		},

		async downloadOriginalFromStatic (): Promise<void> {
			if (!this.photoUrlOriginal) return;
			this.localLoading = true;
			const image = await axios_downloadPhoto.photo_get(this.photoUrlOriginal);
			this.localLoading = false;
			if (image) {
				const url = window.URL.createObjectURL(new Blob([ image ]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', `${this.photoPerson}-${this.photoDate}.jpeg`);
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		},
	},
	
});
</script>

<style>
.rotated {
	transform: rotate(180deg);
}
</style>