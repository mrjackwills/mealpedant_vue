<template>
	<v-row class='my-0' justify='center'>
		<v-col
			v-if='memory'
			class='mt-8'
			cols='12'
			md='6'
			sm='8'
		>
			<v-row
				v-for='(value, name) in memory'
				:key='name'
				align='center'
				class='my-0'
				justify='space-around'
			>
				<v-col class='pa-0 text-right' cols='4'>
					{{ name }}:
				</v-col>
				<v-col v-if='!name.includes("uptime")' class='pa-0 text-left' cols='4'>
					{{ bytes_to_mb(Number(value)) }} mb
				</v-col>
				<v-col v-else class='pa-0 text-left' cols='4'>
					{{ secondsToText(Number(value)) }}
				</v-col>
				<v-col class='ma-0 pa-0' cols='12' sm='6'>
					<v-divider />
				</v-col>
			</v-row>
			<v-row class='mt-2' justify='center'>
				<v-col cols='auto'>
					<v-row
						v-for='(item, index) in buttonArray'
						:key='index'
						align='center'
						class='no-gutters'
						:class='{ "mt-4": index === 1 }'
						justify='center'
					>
						<v-col class='pa-0' cols='12' md='auto'>
							<v-btn
								:block='smAndDown'
								:color='item.color'
								min-width='25vw'
								rounded
								variant='flat'
								@click='restartDialog'
							>
								<ButtonIcon color='white' :icon='item.icon' small />
								<span class='text-white'>{{ item.text }}</span>
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import type { PV, TAuthObject, TServerStats, u } from '@/types'
import { mdiRestartAlert } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { axios_admin } from '@/services/axios'
import { dialoger } from '@/services/dialog'
import { snackSuccess } from '@/services/snack'
import { bytes_to_mb, secondsToText } from '@/vanillaTS/helpers'
const { smAndDown } = useDisplay()

onBeforeUnmount(() => {
	clearTimeouts()
})

const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})
const memory = computed((): u<TServerStats> => adminModule().memory)

const buttonArray = [
	{
		text: 'restart application',
		icon: mdiRestartAlert,
		color: 'error',
		click: 'restartDialog' as const,
	},
]
const disabledTimeout = ref(0)
const pageTimeout = ref(0)
const secondsInterval = ref(0)

// Clear all timers
function clearTimeouts (): void {
	clearTimeout(disabledTimeout.value)
	clearInterval(secondsInterval.value)
	clearTimeout(pageTimeout.value)
}

// Open dialog, and start countdown timer for confirm button
async function restartDialog (): PV {
	dialoger({
		message: 'Are you sure you want to restart the server?',
		buttonText: 'restart',
		title: 'Restart Server',
		passwordRequired: true,
		confirmFunction: restartServer,
	})
}

/*
 * Send axios request to restart app, if no error, refresh memory stats with snack
 * @param {Object} AuthObject - {password: string, token?:string, twoFABackup?:boolean}
 */
async function restartServer (authObject: TAuthObject): PV {
	loading.value = true
	snackSuccess({
		message: `restarting server`,
		loading: true,
		type: 'info',
		timeout: 4000,
	})
	pageTimeout.value = window.setTimeout(() => axios_admin.memory_get(), 5000)
	await axios_admin.restart_put(authObject)
	loading.value = false
}
</script>
