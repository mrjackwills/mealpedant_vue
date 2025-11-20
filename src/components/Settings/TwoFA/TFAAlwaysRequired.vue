<template>
	<section v-if='!backupProcess' class='mt-5'>
		<v-row align='center' class='ma-0 pa-0' justify='center'>
			<v-col class='ma-0 pa-0' cols='12' md='8'>
				<v-row align='center' class='ma-0 pa-0' justify='center'>
					<v-col class='ma-0 pa-0' cols='auto' @click='toggle'>
						<v-switch
							v-model='arVal'
							class='ma-0 pa-0'
							color='primary'
							density='compact'
							:disabled='backupProcess'
							label=''
						>
							<template #label>
								<span class=''>Extra Two-Factor Authentication prompts</span>
							</template>
						</v-switch>
					</v-col>
				</v-row>
				<v-row align='center' class='ma-0 pa-0 mt-n4' justify='center'>
					<v-col class='ma-0 pa-0' cols='12'>
						When enabled, a Two Factor Authentication token will be required at all password prompts.
						Otherwise, a Two
						Factor Authentication token will only be required at login.
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</section>
</template>

<script setup lang='ts'>
import type { PV, TAuthObject } from '@/types'
import { mdiDeleteCircle } from '@mdi/js'
import { axios_authenticatedUser } from '@/services/axios'
import { dialoger } from '@/services/dialog'
import { snackSuccess } from '@/services/snack'

const arVal = ref(false)

onMounted(() => {
	arVal.value = always_required.value
})

const always_required = computed({
	get (): boolean {
		return twoFAModule().alwaysRequired
	},
	set (b: boolean): void {
		twoFAModule().set_alwaysRequired(b)
	},
})

watch(always_required, () => {
	arVal.value = always_required.value
})

watch(arVal, () => {
	arVal.value = always_required.value
})

const backupProcess = computed(() => twoFAModule().backupProcess)
const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})

async function confirm_function (authObject: TAuthObject): PV {
	loading.value = true
	const success = await axios_authenticatedUser.setupTwoFA_patch({
		...authObject,
		always_required: false,
	})
	if (success) snackSuccess({
		message: 'extra two-factor authentication prompts removed',
		icon: mdiDeleteCircle,
	})
	loading.value = false
}

function show_dialog (): void {
	dialoger({
		message: 'are you sure you want to remove the extra two-factor authentication prompts?',
		buttonText: 'confirm',
		title: 'Confirm',
		passwordRequired: true,
		confirmFunction: confirm_function,
	})
}

async function toggle (): PV {
	if (always_required.value) {
		show_dialog()
	} else {
		loading.value = true
		const success = await axios_authenticatedUser.setupTwoFA_patch({ always_required: true })
		if (success) snackSuccess({ message: 'extra two-factor authentication prompts enabled' })
		loading.value = false
	}
}
</script>
