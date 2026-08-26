<template>
	<v-container class='' fluid>
		<v-row class='justify-center' wrap>
			<v-col cols='12' md='4' sm='8'>
				<v-form method='post' @submit.prevent>
					<div v-for='(item, index) in textFields' :key='index'>
						<v-expand-transition>
							<HibpMessage v-if='item.label === "invite" && passwordCompromised' :password-compromised />
						</v-expand-transition>

						<v-text-field
							v-model='user[item.model]'
							:append-inner-icon='item.appendIcon'
							:autocomplete='item.autocomplete'
							:disabled='loading || completed'
							:error='errorMessages[item.model].length > 0'
							:error-messages='errorMessages[item.model]||externalErrors[item.model]'
							:label='item.label'
							:prepend-inner-icon='item.icon'
							:type='item.type'
							variant='underlined'
							@blur='cleanTouch(item.model)'
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
						:color='loading || v$.$invalid || completed ? "" : "secondary"'
						:disabled='loading || v$.$invalid || completed'
						large
						rounded
						:variant='loading || v$.$invalid || completed ? "outlined" : "flat"'
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

const password_visible = ref(false)

// Set the password field visible
function appendClick (model: string): void {
	if (model === 'password') password_visible.value = !password_visible.value
}

const completed = ref(false)

const passwordCompromised = ref(false)
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

async function register (): PV {
	if (v$.value.$invalid) return
	if (user.value.password.toLowerCase().includes(user.value.email.toLowerCase().trim())) return
	loading.value = true
	passwordCompromised.value = await passwordCheck(user.value.password)
	if (passwordCompromised.value) {
		externalErrors.value.password = 'invalid password'
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

function cleanTouch (name: string): void {
	if (name === 'email' || name === 'invite') {
		user.value[name] = user.value[name].toLowerCase().trim()
	}
	touch(name)
}

function touch (name: string): void {
	if (name === 'password') {
		externalErrors.value.password = ''
		passwordCompromised.value = false
	}
	v$.value[name]?.$touch()
}

const externalErrors = ref({
	password: '',
	email: '',
	full_name: '',
	invite: '',
})

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
const v$ = useVuelidate(rules, user, { $externalResults: externalErrors })

const errorMessages = computed(() => {
	const ev = v$.value.email
	const fv = v$.value.full_name
	const iv = v$.value.invite
	const pv = v$.value.password

	let emailErr = ''
	if (ev?.$dirty) {
		if (user.value.email.length === 0) {
			emailErr = 'email required'
		} else if (ev.email.$invalid) {
			emailErr = 'email invalid'
		}
	}

	let fullNameErr = ''
	if (fv?.$dirty && user.value.full_name.length === 0) {
		fullNameErr = 'full name required'
	}

	let inviteErr = ''
	if (iv?.$dirty && user.value.invite.length === 0) {
		inviteErr = 'invite required'
	}

	let passwordErr = ''
	if (pv?.$dirty) {
		const emailVal = user.value.email.toLowerCase().trim()
		const passVal = user.value.password.toLowerCase()

		if (emailVal && passVal.includes(emailVal)) {
			passwordErr = 'Your password cannot contain your email'
		} else if (user.value.password.length === 0) {
			passwordErr = 'password required'
		} else if (pv.minLen.$invalid) {
			passwordErr = '12 characters minimum'
		}
	}

	return {
		email: emailErr,
		full_name: fullNameErr,
		invite: inviteErr,
		password: passwordErr,
	}
})

</script>
