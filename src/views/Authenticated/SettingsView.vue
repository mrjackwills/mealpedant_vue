<template>
	<v-container v-if='pageInit' class='fill-height' fluid>
		<v-row align='center' class='ma-0 pa-0' justify='center'>
			<v-col class='ma-0 pa-0' cols='11'>
				<TwoFactor />
			</v-col>
			<v-col v-if='!setupProcessStarted && !backupProcess' class='pa-0' cols='11'>
				<v-row class='no-gutters my-3' justify='center'>
					<v-col cols='12' md='6' sm='8'>
						<v-divider />
					</v-col>
				</v-row>
			</v-col>
			<v-col v-if='!setupProcessStarted && !backupProcess' class='ma-0 pa-0 mb-8' cols='11'>
				<ChangePassword />
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import { axios_authenticatedUser } from '@/services/axios'

const backupProcess = computed(() => twoFAModule().backupProcess)
const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})
const setupProcessStarted = computed(() => twoFAModule().setupProcessStarted)
const pageInit = ref(false)

onBeforeMount(async () => {
	loading.value = true
	await axios_authenticatedUser.authenticated_get()
	pageInit.value = true
	loading.value = false
})
onMounted(() => {
	const browserStore = browserModule()
	browserStore.set_pageTitle('Settings')
	browserStore.set_description('Meal Pedant - User settings')
})

</script>
