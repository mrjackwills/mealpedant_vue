<template>
	<v-container class='fill-height' fluid>
		<v-row align='center' justify='center' wrap>
			<v-col cols='12' md='9'>
				<p class='text-center mb-2' :class='fontSize'>Please enter a new password</p>
				<v-row align='center' justify='center' wrap>
					<v-col cols='12' md='5' sm='8'>
						<v-form method='post' @submit.prevent>
							<v-text-field
								v-for='(item, index) in textFields'
								:key='index'
								v-model='user[item.model]'
								:append-inner-icon='item.appendIcon'
								autocomplete='new-password'
								:disabled='loading || completed'
								:error='errors[item.model]'
								:error-messages='errorMessages[item.model]'
								:label='item.label'
								:prepend-inner-icon='item.icon'
								:type='item.type'
								variant='underlined'
								@blur='touch(item.model)'
								@click:append-inner='new_passwordVisible = !new_passwordVisible'
								@input='touch(item.model)'
								@keyup.enter='reset'
							/>
							<v-expand-transition>
								<PasswordContainsEmail v-if='errors.new_password && !passNum' />
								<HibpMessage v-if='passNum' :pass-num />
							</v-expand-transition>
							<section v-if='twoFA_active'>
								<v-text-field
									v-for='item in tokenFields'
									:key='item.model'
									v-model='user[item.model]'
									:dense='smAndDown'
									:disabled='loading || completed'
									:error='errors[item.model]'
									:error-messages='errorMessages[item.model]'
									:label='item.label'
									:prepend-inner-icon='item.icon'
									required
									@blur='touch(item.model)'
									@input='touch(item.model)'
								/>
							</section>
						</v-form>
						<div class='text-center mt-1'>
							<v-btn
								:color='loading || v$.$invalid || completed || errors.new_password || disabled ? "" : "secondary"'
								:disabled='loading || v$.$invalid || completed || errors.new_password || disabled'
								rounded
								size='large'
								:variant='loading || v$.$invalid || completed || errors.new_password || disabled ? "outlined" : "flat"'
								@click='reset'
							>
								<ButtonIcon :icon='mdiCached' />
								Change
							</v-btn>
						</div>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import type { u } from '@/types'
import { mdiCached, mdiCellphoneInformation, mdiEye, mdiEyeOff, mdiLock, mdiLockReset } from '@mdi/js'
import useVuelidate from '@vuelidate/core'
import { minLength, required } from '@vuelidate/validators'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { axios_incognito } from '@/services/axios'
import { snackSuccess } from '@/services/snack'
import { FrontEndRoutes } from '@/types/const_routes'
import { passwordCheck } from '@/vanillaTS/hibp'
const { mdAndDown, smAndDown } = useDisplay()

onBeforeUnmount(() => {
	resetPasswordModule().$reset()
})

const disabled = computed(() => twoFA_active.value && !user.value.token)
const fontSize = computed(() => mdAndDown.value ? 'text-subtitle-1' : 'text-h5')

const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})
const resetId = computed(() => resetPasswordModule().id)
const twoFA_active = computed(() => resetPasswordModule().two_fa_active)
const textFields = computed(() => [
	{
		autocomplete: 'new-password',
		icon: mdiLock,
		label: 'new password',
		model: 'new_password' as const,
		type: new_passwordVisible.value ? 'text' : 'password',
		appendIcon: new_passwordVisible.value ? mdiEyeOff : mdiEye,
	},
])
const watcher_password = computed(() => user.value.new_password)

const completed = ref(false)
const errorMessages = ref({
	new_password: '',
	token: '',
})
const errors = ref({
	new_password: false,
	token: false,
})
const new_passwordVisible = ref(false)
const passNum = ref(false)
const tokenFields = ref([
	{
		clearable: true,
		icon: mdiCellphoneInformation,
		label: '2FA code',
		model: 'token' as const,
	},
])
const user = ref({
	new_password: '',
	token: undefined as u<string>,
})

onMounted(() => {
	const browserStore = browserModule()
	browserStore.set_pageTitle('Reset Password')
	browserStore.set_description('Meal Pedant - Reset your password')
})

const router = useRouter()

function touch (name: string): void {
	v$.value[name]?.$touch()
}

async function reset (): Promise<void> {
	if (v$.value.$invalid || !resetId.value || (twoFA_active.value && !user.value.token)) return
	loading.value = true
	passNum.value = await passwordCheck(user.value.new_password)
	if (passNum.value) {
		errors.value.new_password = true
		loading.value = false
		return
	}
	errorMessages.value = {
		token: '',
		new_password: '',
	}
	errors.value = {
		token: false,
		new_password: false,
	}
	const success = await axios_incognito.reset_patch({
		resetId: resetId.value,
		password: user.value.new_password,
		token: user.value.token,
	})
	loading.value = false
	if (success) {
		completed.value = true
		await router.push(FrontEndRoutes.SIGNIN)
		snackSuccess({
			message: 'password changed',
			timeout: 10_000,
			icon: mdiLockReset,
		})
	} else {
		user.value.new_password = ''
		if (twoFA_active.value) {
			user.value.token = ''
			errorMessages.value.token = 'invalid token'
		}
	}
}

watch(watcher_password, () => {
	passNum.value = false
	errors.value.new_password = false
	if (!v$.value.user?.new_password?.$invalid && !passNum.value) errorMessages.value.new_password = ''
	else if (!v$.value.user?.new_password?.$dirty) return
	else if (!v$.value.user?.new_password?.required) errorMessages.value.new_password = 'password required'
	else if (!v$.value.user?.new_password?.minLength) errorMessages.value.new_password = '12 characters minimum'
})

const rules = {
	new_password: {
		required,
		minLen: minLength(12),
	},
}
const v$ = useVuelidate(rules, user)
</script>
