<template>
	<div class='text-center'>
		<v-dialog
			v-model='dialog'
			eager
			max-width='650'
			scroll-strategy='none'
			width='100%'
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
								variant='text'
							>
								<v-progress-circular
									v-if='localLoading && index === 0'
									:size='spinnerSize'
									:width='spinnerWidth'
									class='mr-2'
									indeterminate
									small
								/>
								<v-icon v-if='!localLoading && index === 0' class='rotated mr-2' style='vertical-align: middle' :size='iconSize' :icon='item.icon' />
								<span class='text-subtitle-1' :class='{"text-caption" : mdAndDown}'>{{ item.text }} </span>
								<v-icon v-if='!localLoading && index === 1' class='ml-2' style='vertical-align: middle' :size='iconSize' :icon='item.icon' />
							</v-btn>
						</v-col>
					</v-row>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup lang='ts'>
import { axios_downloadPhoto } from '@/services/axios';
import { env } from '@/vanillaTS/env';
import { mdiPublish, mdiClose } from '@mdi/js';
import type { su, TPerson, u } from '@/types';
import { useDisplay } from 'vuetify';
const { lgAndUp, mdAndDown } = useDisplay();
		
const dialog = computed({
	get (): boolean {
		return foodModule().dialog;
	},
	set (b: boolean): void {
		foodModule().set_dialog(b);
	}
});
const imgSource = computed((): string => {
	return `${env.domain_static}${photoUrlConverted.value}`;
});

const photoDate = computed((): su => {
	return foodModule().photo_date;
});
const photoPerson = computed((): u<TPerson> => {
	return foodModule().photo_person;
});
const photoUrlConverted = computed((): su => {
	return foodModule().photo_url_converted;
});
const photoUrlOriginal = computed((): su => {
	return foodModule().photo_url_original;
});
const iconSize = computed((): string => {
	return lgAndUp.value ? 'large' : mdAndDown.value? 'small' :'';
});
const spinnerSize = computed((): string => {
	return mdAndDown.value ? '16' : '32';
});
const spinnerWidth = computed((): string => {
	return mdAndDown.value ? '2' : '4';
});
const textColor = computed((): string => {
	return photoPerson.value ==='Dave' ? 'primary': 'secondary';
});
const textColorClass = computed((): string => {
	return textColor.value === 'primary' ? 'black--text' : '';
});
const windowHeight = computed((): number => {
	return window.innerHeight * .70;
});

const buttonFields = [
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
];
const localLoading = ref(false);

const click = (x: 'closeDialog' | 'downloadOriginalFromStatic'): void => {
	switch (x) {
	case 'closeDialog':
		closeDialog();
		break;
	case 'downloadOriginalFromStatic':
		downloadOriginalFromStatic();
		break;
	}
} ;

const closeDialog = (): void => {
	dialog.value = false;
	localLoading.value = false;
};

const downloadOriginalFromStatic = async (): Promise<void> => {
	if (!photoUrlOriginal.value) return;
	localLoading.value = true;
	const image = await axios_downloadPhoto.photo_get(photoUrlOriginal.value);
	localLoading.value = false;
	if (image) {
		const url = window.URL.createObjectURL(new Blob([ image ]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `${photoPerson.value}-${photoDate.value}.jpeg`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
};
	
</script>

<style>
.rotated {
	transform: rotate(180deg);
}
</style>