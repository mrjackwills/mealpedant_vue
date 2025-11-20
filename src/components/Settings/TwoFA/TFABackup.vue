<template>
	<section>
		<v-row v-if='!backup' align='center' class='ma-0 pa-0' justify='center'>
			<v-col class='pa-0 mb-4' cols='12' md='8'>
				Backups enable a user to login to their account in situations where their two factor authentication app
				is unavailable.
				Each backup code can only be used once, and must be safely stored by the user.
				<br>
				<br>
				All backup tokens are salted and hashed before being written to the database. This means that lost
				backup tokens cannot be retrieved by Meal Pedant.
			</v-col>
		</v-row>
		<v-expand-transition>
			<v-row v-if='backupArray.length === 0' align='center' class='ma-0 pa-0' justify='center'>
				<v-col class='ma-0 pa-0' cols='12' lg='4'>
					<v-row justify='center'>
						<v-col cols='auto'>
							<v-btn
								color='secondary'
								:disabled='localLoading'
								rounded
								variant='flat'
								@click='buttonPress'
							>
								<v-icon :icon='backupButtonIcon' />
								{{ backupButtonText }}
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</v-expand-transition>
		<v-expand-transition>
			<section v-if='backupArray.length > 0'>
				<section>
					<v-row align='center' class='ma-0 pa-0' justify='center'>

						<v-col class='ma-0 pa-0' cols='auto'>
							These backup tokens need to be stored securely, each token can only be used once
						</v-col>

					</v-row>
					<v-row
						align='center'
						class='mt-4'
						dense
						justify='center'
						no-gutters
					>
						<v-col class='ma-0 pa-0' cols='12' md='auto'>
							<v-row class='ma-0 pa-0' justify='space-between'>
								<v-col cols='5'>
									<div v-for='(item, index) in backupArray.slice(0, 5)' :key='index'>
										{{ item }}
									</div>
								</v-col>
								<v-col cols='5'>
									<div v-for='(item, index) in backupArray.slice(5, 10)' :key='index'>
										{{ item }}
									</div>

								</v-col>
							</v-row>
						</v-col>
					</v-row>
					<v-row
						align='center'
						class='mt-4'
						dense
						justify='space-around'
						no-gutters
					>

						<v-col cols='auto'>
							<v-btn color='error' rounded variant='flat' @click='close'>
								<v-icon :icon='mdiClose' />
								close
							</v-btn>
						</v-col>
						<v-col class='mx-2' :class='{ "my-2": smAndDown }' cols='auto'>
							<v-btn
								class='text-black'
								color='primary'
								:dark='true'
								rounded
								variant='flat'
								@click='downloadCodes'
							>
								<v-icon color='black' :icon='mdiDownload' />
								download
							</v-btn>

						</v-col>
						<v-col id='tooltip' cols='auto'>
							<v-btn color='secondary' rounded variant='flat' @click='copyCodes'>
								<v-icon :icon='mdiContentCopy' />
								copy all
							</v-btn>
							<v-tooltip
								v-if='showTooltip'
								activator='parent'
								content-class='tooltip'
								location='top center'
								:open-on-click='true'
								:open-on-hover='false'
							>
								<span>copied to clipboard</span>
							</v-tooltip>

						</v-col>
					</v-row>
				</section>
			</section>
		</v-expand-transition>
	</section>
</template>

<script setup lang='ts'>
import type { PV, TAuthObject } from '@/types'
import { mdiClose, mdiContentCopy, mdiDownload, mdiShieldKey, mdiShieldRefresh } from '@mdi/js'
import { useClipboard } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import { axios_authenticatedUser } from '@/services/axios'
import { dialoger } from '@/services/dialog'
const { smAndDown } = useDisplay()

onBeforeUnmount(() => {
	clearTimeout(tooltipTimeout.value)
})

const backup = computed(() => twoFAModule().backup_count > 0)
const backupButtonIcon = computed(() => backup.value ? mdiShieldRefresh : mdiShieldKey)
const backupButtonText = computed(() => backup.value ? 'refresh backup tokens' : 'generate backup tokens')
const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})

const backupArray = ref([] as Array<string>)
const localLoading = ref(false)
const showTooltip = ref(false)
const tooltipTimeout = ref(0)

function backupCodes (): string {
	if (!backupArray.value) return ''
	let output = `Meal Pedant Two-Factor backup tokens\nStore these somewhere secure\n`
	for (const [index, item] of Object.entries(backupArray.value)) {
		output += Number(index) + 1 === backupArray.value.length ? `\n${item}` : `\n${item}\n`
	}
	return output
}
function close (): void {
	backupArray.value = []
	twoFAModule().set_backupProcess(false)
}

// Copy the 2fa codes, create multi-line string with description as first line
function copyCodes (): void {
	useClipboard().copy(backupCodes())
	showTooltip.value = true
	tooltipTimeout.value = window.setTimeout(() => {
		showTooltip.value = false
	}, 1750)
}

// Download the 2fa codes as .txt, all clientside, create multi-line string with description as first line
function downloadCodes (): void {
	const downloadCodes = document.createElement('a')
	downloadCodes.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(backupCodes()))
	downloadCodes.setAttribute('download', 'Meal_Pedant_2FA_backup_tokens.txt')
	downloadCodes.style.display = 'none'
	document.body.append(downloadCodes)
	downloadCodes.click()
	downloadCodes.remove()
}

// Generate button - dialog warning overwrite if backups already exist, else just generate
async function buttonPress (): PV {
	if (backup.value) {
		dialoger({
			message: 'Refreshing will revoke all currently active backup tokens, do you wish to continue?',
			buttonText: 'refresh',
			title: 'Confirm',
			passwordRequired: true,
			confirmFunction: generateBackups,
		})
	} else {
		generateBackups()
	}
}

// Post request to generate new backup tokens
async function generateBackups (authObject?: TAuthObject): PV {
	loading.value = true
	localLoading.value = true
	twoFAModule().set_backupProcess(true)
	if (backup.value && authObject) {
		const response = await axios_authenticatedUser.twoFA_patch(authObject)
		if (response) backupArray.value = response
	} else if (!backup.value) {
		const backups = await axios_authenticatedUser.twoFA_post()
		if (backups) backupArray.value = backups
	}
	loading.value = false
	localLoading.value = false
	await axios_authenticatedUser.authenticated_get()
}
</script>
