<template>
	<v-row justify='center' class='no-gutters'>
		<v-col cols='12' sm='8' md='6'>
			<v-data-table
				:headers='headers'
				:items='backup'
				:mobile-breakpoint='0'
				class='elevation-1 mt-4'
			>
				<template v-slot:item='{item}'>
					<tr >
						<td class='text-left cl' @click='downloadFile(item.file_name)'>
							<app-button-icon :icon='mdiDownload' :xsmall='$vuetify.breakpoint.mdAndDown' margin='mr-1'/><span :class='{"smalltext": $vuetify.breakpoint.mdAndDown}'>{{ item.file_name }}</span>
						</td>
						<td class='text-right'>
							<div :class='{"smalltext": $vuetify.breakpoint.mdAndDown}'>{{ bytes_to_mb(item.file_size) }} mb</div>
						</td>
						<td class='text-right cl' @click='deleteFile(item.file_name)'>
							<app-button-icon color='red' :icon='mdiCloseCircleOutline' />
						</td>
					</tr>
				</template>
			</v-data-table>
		</v-col>
		<v-col cols='12' class=''>
			<v-row justify='center' align='center' class='no-gutters'>
				<v-col cols='auto'>
					<div class='text-center'>
						<v-checkbox
							v-model='withPhotos'
							:disabled='localLoading'
							color='primary'
							label='include photos'
						/>
					</div>
				</v-col>
			</v-row>
		</v-col>
		<v-col cols='12' sm='8' md='auto' class=''>
			<v-btn
				@click='createBackup'
				:block='$vuetify.breakpoint.smAndDown'
				:class='{"elevation-0": localLoading}'
				:disabled='localLoading'
				class='elevation-2'
				color='secondary'
				large
			>
				<app-button-icon :icon='mdiFileStar' />
				Create new Backup
			</v-btn>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import Vue from 'vue';
import ButtonIcon from '@/components/ButtonIcon.vue';
import { TBackup } from '@/types';
import { snackSuccess } from '@/services/snack';
import { bytes_to_mb } from '@/vanillaTS/bytesToMb';
import { env } from '@/vanillaTS/env';
import {
	mdiCloseCircleOutline,
	mdiCloudCheck,
	mdiDeleteCircleOutline,
	mdiDownload,
	mdiFileStar
} from '@mdi/js';
import { adminModule, loadingModule } from '@/store';
import { axios_admin } from '@/services/axios';
export default Vue.extend({
	name: 'admin-backup-component',

	components: {
		appButtonIcon: ButtonIcon,
	},

	computed: {
		backup (): TBackup {
			return adminModule().backup;
		},

		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
	},

	data: () => ({
		headers: [
			{
				text: 'name',
				align: 'left',
				sortable: true,
				value: 'file_name'
			},
			{
				text: 'size',
				align: 'right',
				sortable: true,
				value: 'file_size'
			},
			{
				text: 'delete',
				align: 'right',
				sortable: false,
			},
		],
		mdiDownload,
		mdiCloseCircleOutline,
		mdiFileStar,
		localLoading: false,
		withPhotos: true,
	}),
	
	methods: {
		
		bytes_to_mb (x: number): number {
			return bytes_to_mb(x);
		},
		
		/**
		 ** Request to create new backup, use checkbox data to include photos or not, automatically refreshes backup file list
		 */
		async createBackup (): Promise<void> {
			this.loading = true;
			this.localLoading = true;
			const response = await axios_admin.backup_post(this.withPhotos);
			if (response) {
				await axios_admin.backup_get();
				snackSuccess({ message: 'New backup created', icon: mdiCloudCheck });
			}
			this.loading = false;
			this.localLoading = false;
		},
		/**
		 ** Request to delete selected backupfile, automatically refreshes backup file list
		 * @param {string} filename valid filename of format /^mealpedant_\d{4}-\d{2}-\d{2}_\d{2}\.\d{2}\.\d{2}_(PHOTOS_)?SQL_REDIS_LOGS_[0-9a-fA-F]{8}\.tar\.gpg$/
		 */
		async deleteFile (fileName: string): Promise<void> {
			if (this.loading) return;
			this.loading = true;
			const response = await axios_admin.backup_delete(fileName);
			if (response) {
				await axios_admin.backup_get();
				snackSuccess({ message: `DELETED: ${fileName}`, icon: mdiDeleteCircleOutline });
			}
			this.loading = false;
		},
		/**
		 ** Add href to body of backup link, then click to download
		 * @param {string} filename valid filename of format /^mealpedant_\d{4}-\d{2}-\d{2}_\d{2}\.\d{2}\.\d{2}_(PHOTOS_)?SQL_REDIS_LOGS_[0-9a-fA-F]{8}\.tar\.gpg$/
		 */
		async downloadFile (file_name: string): Promise<void> {
			const downloadLink = document.createElement('a');
			downloadLink.setAttribute('href', `${env.domain_api}/admin/backup/${file_name}`);
			downloadLink.style.display = 'none';
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			this.loading = false;
		},
	},
});
</script>