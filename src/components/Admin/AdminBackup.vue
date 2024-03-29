<template>
	<v-row justify='center' class='no-gutters'>
		<v-col cols='12' sm='8'>
			<v-data-table
				:headers='headers'
				:items='backup'
				class='elevation-1 mt-4'
				density='compact'
			>
				<template v-slot:item='{item}'>
					<tr >
						<td class='text-left cl' @click='downloadFile(item.file_name)'>
							<ButtonIcon :icon='mdiDownload' :size='mdAndDown?"x-small":""' margin='mr-1'/>
							<span class='text-caption'>{{ item.file_name }}</span>
						</td>
						<td class='text-right'>
							<div class='text-caption'>{{ bytes_to_mb(Number(item.file_size)) }} mb</div>
						</td>
						<td class='text-right cl' @click='deleteFile(item.file_name)'>
							<ButtonIcon color='red' :icon='mdiCloseCircleOutline' />
						</td>
					</tr>
				</template>
			</v-data-table>
		</v-col>
		<v-col cols='12' class='ma-0 pa-0'>
			<v-row justify='center' align='center' class='no-gutters ma-0 pa-0'>
				<v-col cols='auto' class='ma-0 pa-0'>
					<div class='text-center'>
						<v-checkbox
							v-model='withPhotos'
							:disabled='localLoading'
							color='primary'
							label='include photos'
							class='mb-n8'
						/>
					</div>
				</v-col>
			</v-row>
		</v-col>
		<v-col cols='12' sm='8' md='auto' class='mb-2'>
			<v-btn
				@click='createBackup'
				:block='smAndDown'
				:color='localLoading?"":"secondary"'
				:disabled='localLoading'
				:variant='localLoading?"outlined":"flat"'
				size='large'
			>
				<ButtonIcon :icon='mdiFileStar' />
				Create new Backup
			</v-btn>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import type { TBackup } from '@/types';
import { snackSuccess } from '@/services/snack';
import { bytes_to_mb } from '@/vanillaTS/bytes_to_mb';
import { env } from '@/vanillaTS/env';
import {
	mdiCloseCircleOutline,
	mdiCloudCheck,
	mdiDeleteCircleOutline,
	mdiDownload,
	mdiFileStar
} from '@mdi/js';
import { axios_admin } from '@/services/axios';
import { useDisplay } from 'vuetify';
const { mdAndDown, smAndDown } = useDisplay();

const backup = computed((): TBackup => {
	return adminModule().backup;
});

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});

const headers = [
	{
		title: 'name',
		align: 'start',
		sortable: true,
		value: 'filename',
		width: '70%'
	},
	{
		title: 'size',
		align: 'end',
		sortable: true,
		value: 'file_size',
		width: '15%',
	},
	{
		title: 'delete',
		align: 'end',
		sortable: false,
		width: '15%'
	},
] as const;
const localLoading = ref(false);
const withPhotos = ref(true);
		
/**
** Request to create new backup, use checkbox data to include photos or not, automatically refreshes backup file list
*/
const createBackup = async (): Promise<void> => {
	loading.value = true;
	localLoading.value = true;
	const response = await axios_admin.backup_post(withPhotos.value);
	if (response) {
		await axios_admin.backup_get();
		snackSuccess({ message: 'New backup created', icon: mdiCloudCheck });
	}
	loading.value = false;
	localLoading.value = false;
};
/**
** Request to delete selected backupfile, automatically refreshes backup file list
* @param {string} filename valid filename of format /^mealpedant_\d{4}-\d{2}-\d{2}_\d{2}\.\d{2}\.\d{2}_(PHOTOS_)?SQL_REDIS_LOGS_[0-9a-fA-F]{8}\.tar\.gpg$/
*/
const deleteFile = async (fileName: string): Promise<void> => {
	if (loading.value) return;
	loading.value = true;
	const response = await axios_admin.backup_delete(fileName);
	if (response) {
		await axios_admin.backup_get();
		snackSuccess({ message: `DELETED: ${fileName}`, icon: mdiDeleteCircleOutline });
	}
	// eslint-disable-next-line require-atomic-updates
	loading.value = false;
} ;
/*
** Add href to body of backup link, then click to download
* @param {string} filename valid filename of format /^mealpedant_\d{4}-\d{2}-\d{2}_\d{2}\.\d{2}\.\d{2}_(PHOTOS_)?SQL_REDIS_LOGS_[0-9a-fA-F]{8}\.tar\.gpg$/
*/
const downloadFile = async (filename: string): Promise<void> => {
	const downloadLink = document.createElement('a');
	downloadLink.setAttribute('href', `${env.domain_api}/admin/backup/${filename}`);
	downloadLink.style.display = 'none';
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
	loading.value = false;
};
</script>