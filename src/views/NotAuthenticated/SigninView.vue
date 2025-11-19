<template>
	<v-container class='fill-height' fluid>
		<v-row align='center' justify='center'>
			<v-col cols='12' md='4' sm='8'>
				<v-form v-if='!twoFARequired' method='post' @submit.prevent>
					<v-text-field
						v-for='(item, index) in textFields'
						:key='index'
						v-model='user[item.model]'
						:append-inner-icon='item.appendIcon'
						:autocomplete='item.autocomplete'
						:disabled='loading || twoFARequired'
						:error-messages='errorMessages[item.model]'
						:label='item.label'
						:prepend-inner-icon='item.icon'
						:type='item.type'
						variant='underlined'
						@blur='touch(item.model)'
						@click:append-inner='appendClick()'
						@input='touch(item.model)'
						@keyup.enter='signin'
					/>
				</v-form>

				<v-expand-transition>
					<v-row v-if='twoFARequired' class='ma-0 pa-0' justify='center'>
						<v-col class='ma-0 pa-0' cols='12' md='9'>
							<v-text-field
								v-model='user.token'
								:autofocus='mdAndUp'
								:disabled='loading'
								:hint='"Your 2FA code is required to sign in"'
								inputmode='numeric'
								label='2FA code'
								pattern='[0-9]*'
								persistent-hint
								:prepend-inner-icon='mdiCellphoneLock'
								variant='underlined'
								@keyup.enter='signin'
							/>
						</v-col>
					</v-row>
				</v-expand-transition>

				<v-row align='center' class='ma-0 pa-0' :class='twoFARequired?"mt-4":"mt-n4"' justify='space-around'>

					<v-col class='ma-0 pa-0 text-center' cols='auto'>
						<v-btn
							v-if='twoFARequired'
							class=''
							color='error'
							:disabled='loading'
							flat
							rounded
							vairant='flat'
							@click='cancel'
						>
							<ButtonIcon :icon='mdiClose' />
							cancel
						</v-btn>
						<v-checkbox
							v-else
							v-model='user.remember'
							class='mt-4'
							color='primary'
							density='compact'
							:disabled='loading || twoFARequired'
							label='remember me'
						/>

					</v-col>

					<v-col class='ma-0 pa-0 text-center' cols='auto'>
						<v-btn
							:color='signin_disabled ? "" : "secondary"'
							:disabled='signin_disabled'
							large
							rounded
							:variant='signin_disabled ? "outlined" : "flat"'
							@click='signin'
						>
							<ButtonIcon :icon='mdiLogin' />
							sign-in
						</v-btn>
					</v-col>

					<v-col v-if='!twoFARequired' class='text-center ma-0 pa-0' cols='12'>
						<router-link
							class='text-white text-right text-body-2 text-decoration-underline'
							:to='localLoading?"":FrontEndRoutes.FORGOTPASSWORD'
						>
							forgot password
						</router-link>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>

import type { PV, su } from '@/types'
import { mdiCellphoneLock, mdiClose, mdiEmail, mdiEye, mdiEyeOff, mdiLockOpenOutline, mdiLogin } from '@mdi/js'
import useVuelidate from '@vuelidate/core'
import { email, minLength, required } from '@vuelidate/validators'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { axios_authenticatedUser, axios_incognito } from '@/services/axios'
import { HttpCode } from '@/types/const_http'
import { FrontEndRoutes } from '@/types/const_routes'
const { mdAndUp } = useDisplay()

const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})
const pwa = computed(() => browserModule().pwa)
const watcher_email = computed(() => user.value.email)
const watcher_password = computed(() => user.value.password)
const signin_disabled = computed(() => loading.value || v$.value.$invalid || (twoFARequired.value && !user.value.token))

const passwordVisible = ref(false)

// / Set the password visible
function appendClick (): void {
	if (loading.value) return
	passwordVisible.value = !passwordVisible.value
}

const errorMessages = ref({
	email: undefined as su,
	password: undefined as su,
})
const otpBackupEnabled = ref(false)
const textFields = computed(() => {
	return [
		{
			icon: mdiEmail,
			model: 'email' as const,
			label: 'email',
			type: 'email',
			appendIcon: '',
			autocomplete: 'username',
		},
		{
			icon: mdiLockOpenOutline,
			model: 'password' as const,
			label: 'password',
			appendIcon: passwordVisible.value ? mdiEyeOff : mdiEye,
			type: passwordVisible.value ? 'text' : 'password',
			autocomplete: 'password',
		},
	]
})

const twoFARequired = ref(false)

const user = ref({
	email: '',
	password: '',
	token: '',
	remember: false,
})

const router = useRouter()

onMounted(() => {
	const browserStore = browserModule()
	browserStore.set_pageTitle('Signin')
	browserStore.set_description('Meal Pedant - Sign in to your Meal Pedant account in order to explore the comprehensive daily log of ingestion')
})

function touch (name: string): void {
	v$.value.user?.[name]?.$touch()
}

// / On 2fa screen reset user data nad go back to blank signin page
function cancel (): void {
	twoFARequired.value = false
	user.value = {
		email: '',
		password: '',
		token: '',
		remember: false,
	}
	otpBackupEnabled.value = false
}
const localLoading = ref(false)

// / axios method to sign in user, works with both 2fa and non 2fa users
async function signin (): PV {
	if (v$.value.$invalid || !user.value.email || !user.value.password || (twoFARequired.value && !user.value.token)) return
	if (pwa.value) user.value.remember = true
	localLoading.value = true
	loading.value = true
	const authObject = {
		email: user.value.email.toLowerCase(),
		password: user.value.password,
		token: user.value.token ? user.value.token.replace(/\s/g, '') : undefined,
		remember: user.value.remember,
	}
	passwordVisible.value = false
	const loginRequest = await axios_incognito.signin_post(authObject)
	if (loginRequest?.status === HttpCode.OK) {
		userModule().set_authenticated(true)
		snackbarModule().$reset()
		infobarModule().$reset()
		mealModule().$reset()
		mealStorage.delete()
		await axios_authenticatedUser.authenticated_get()
		await mealStorage.seed_meal_pinia()
		user.value = {
			email: '',
			password: '',
			token: '',
			remember: false,
		}
		router.push(FrontEndRoutes.MEALS)
	} else if (loginRequest?.status === HttpCode.ACCEPTED) {
		twoFARequired.value = true
		otpBackupEnabled.value = loginRequest.response.twoFABackup
		snackbarModule().$reset()
	} else {
		cancel()
	}
	loading.value = false
	localLoading.value = false
}

const rules = {
	email: {
		email,
		required,
	},
	password: {
		required,
		minLen: minLength(12),
	},
}
const v$ = useVuelidate(rules, user)

watch(watcher_email, () => {
	if (!user.value.email) {
		[twoFARequired.value, user.value.password] = [false, '']
		v$.value.user?.email?.$reset()
		return
	}
	user.value.email = user.value.email.trim().toLowerCase()
	if (!v$.value.user?.email?.$invalid) errorMessages.value.email = undefined
	else if (!v$.value.user?.email?.$dirty) return
	else if (!v$.value.user?.email?.required) errorMessages.value.email = 'email required'
	else if (!v$.value.user?.email?.email) errorMessages.value.email = 'email invalid'
})

watch(watcher_password, () => {
	if (user.value.password) {
		v$.value.user?.password?.$reset()
		return
	}
	if (!v$.value.user?.password?.$invalid) errorMessages.value.password = undefined
	else if (!v$.value.user?.password?.$dirty) return
	else if (!v$.value.user?.password?.required) errorMessages.value.password = 'password required'
})
</script>
