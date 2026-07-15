<template>
	<v-container class='' fluid>
		<v-row class='justify-center' wrap>
			<v-col cols='12' md='4' sm='8'>
				<v-form method='post' @submit.prevent>
					<div v-for='(item, index) in textFields' :key='index'>
						<v-expand-transition>
							<HibpMessage v-if='item.label === "invite" && passNum' :pass-num />
						</v-expand-transition>

						<v-text-field
							v-model='user[item.model]'
							:append-inner-icon='item.appendIcon'
							:autocomplete='item.autocomplete'
							:disabled='loading || completed'
							:error='errors[item.model]'
							:error-messages='errorMessages[item.model]'
							:label='item.label'
							:prepend-inner-icon='item.icon'
							:type='item.type'
							variant='underlined'
							@blur='touch(item.model)'
							@click:append-inner='appendClick(item.model)'
							@input='touch(item.model)'
							@keyup.enter='register'
						/>
					</div>
				</v-form>

				<div class='text-center mt-1'>
					<v-btn
						class='elevation-0 mr-4'
						:color='loading || completed ? "" : "error"'
						dark
						:disabled='loading || completed'
						large
						rounded
						:variant='loading || completed ? "outlined" : "flat"'
						@click='cancel'
					>
						<ButtonIcon :icon='mdiClose' />
						cancel
					</v-btn>

					<v-btn
						class='elevation-0'
						:color='loading || v$.$invalid || errors.password || completed ? "" : "secondary"'
						dark
						:disabled='loading || v$.$invalid || errors.password || completed'
						large
						rounded
						:variant='loading || v$.$invalid || errors.password || completed ? "outlined" : "flat"'
						@click='register'
					>
						<ButtonIcon :icon='mdiAccountPlus' />
						Register
					</v-btn>
				</div>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>

import type { PV } from '@/types'
import {
	mdiAccount,
	mdiAccountPlus,
	mdiClose,
	mdiEmail,
	mdiEye,
	mdiEyeOff,
	mdiKeyboard,
	mdiLock,
} from '@mdi/js'
import useVuelidate from '@vuelidate/core'
import { email, minLength, required } from '@vuelidate/validators'
import { fetch_incognito } from '@/services/fetch'
import { snackSuccess } from '@/services/snack'
import { FrontEndRoutes } from '@/types/const_routes'
import { passwordCheck } from '@/vanillaTS/hibp'

const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})

const watcher_email = computed(() => user.value.email)
const watcher_full_name = computed(() => user.value.full_name)
const watcher_invite = computed(() => user.value.invite)
const watcher_password = computed(() => user.value.password)

const password_visible = ref(false)

// Set the password field visible
function appendClick (model: string): void {
	if (model === 'password') password_visible.value = !password_visible.value
}

const completed = ref(false)
const errorMessages = ref({
	email: '',
	full_name: '',
	password: '',
	invite: '',
})

const errors = ref({
	email: false,
	full_name: false,
	password: false,
	invite: false,
})
const passNum = ref(false)
const textFields = computed(() => [
	{
		autocomplete: 'full_name',
		icon: mdiAccount,
		label: 'full name',
		model: 'full_name' as const,
		type: 'text',
	},
	{
		autocomplete: 'email',
		icon: mdiEmail,
		label: 'email',
		model: 'email' as const,
		type: 'text',
	},
	{
		autocomplete: 'new-password',
		icon: mdiLock,
		label: 'password',
		model: 'password' as const,
		type: password_visible.value ? 'text' : 'password',
		appendIcon: password_visible.value ? mdiEyeOff : mdiEye,
	},
	{
		autocomplete: 'invite',
		icon: mdiKeyboard,
		label: 'invite',
		model: 'invite' as const,
		type: 'text',
	},
])
const user = ref({
	email: '',
	full_name: '',
	invite: '',
	password: '',
})

onMounted(() => {
	const browserStore = browserModule()
	browserStore.set_pageTitle('Register')
	browserStore.set_description('Meal Pedant - Register for an account in order to gain access to the daily log of ingestion')
})

const router = useRouter()

// On cancel button press, either go to base page, or meal page, depedning if meal page has already been visited
async function cancel (): PV {
	await (mealModule().meals_length > 0 ? router.push(FrontEndRoutes.MEALS) : router.push(FrontEndRoutes.BASE))
}

function touch (name: string): void {
	v$.value[name]?.$touch()
}
async function register (): PV {
	if (v$.value.$invalid) return
	if (user.value.password.toLowerCase().includes(user.value.email.toLowerCase().trim())) {
		errors.value.password = true
		return
	}
	loading.value = true
	passNum.value = await passwordCheck(user.value.password)
	if (passNum.value) {
		errors.value.password = true
		loading.value = false
		return
	}
	password_visible.value = false
	const registerRequest = await fetch_incognito.register_post(user.value)
	if (registerRequest) {
		completed.value = true
		snackSuccess({
			message: registerRequest,
			timeout: 20_000,
			closable: false,
			type: 'success',
		})
	}
	loading.value = false
}

const rules = {
	email: {
		email,
		required,
	},
	full_name: { required },
	invite: { required },
	password: {
		required,
		minLen: minLength(12),
	},
}
const v$ = useVuelidate(rules, user)

watch(watcher_email, () => {
	user.value.email = user.value.email.toLowerCase().trim()
	if (v$.value.email?.$dirty && user.value.email.length === 0) errorMessages.value.email = 'email required'
	else errorMessages.value.email = v$.value.email?.email.$invalid ? 'email invalid' : ''
})

watch(watcher_full_name, () => {
	errorMessages.value.full_name = v$.value.full_name?.$dirty && user.value.full_name.length === 0 ? 'full name required' : ''
})

watch(watcher_invite, () => {
	user.value.invite = user.value.invite.toLowerCase().trim()
	errorMessages.value.invite = v$.value.invite?.$dirty && user.value.invite.length === 0 ? 'invite required' : ''
})

watch(watcher_password, () => {
	passNum.value = false
	errors.value.password = false
	if (user.value.email && user.value.password.toLowerCase().includes(user.value.email.toLowerCase().trim())) errorMessages.value.password = 'Your password cannot containt your email'
	if (v$.value.password?.minLen.$invalid) {
		errorMessages.value.password = '12 characters minimum'
	} else if (v$.value.password?.$dirty && user.value.password.length === 0) {
		errorMessages.value.password = 'password required'
	} else {
		errorMessages.value.password = ''
	}
})

</script>
