<template>
	<v-container class='fill-height' fluid>
		<v-row align='center' justify='center' wrap>
			<v-col cols='12' md='9'>
				<p class='text-center mb-2' :class='fontSize'>Enter your email address to receive instructions on how to
					reset your password</p>
				<v-row align='center' justify='center' wrap>
					<v-col cols='12' md='4' sm='8'>
						<v-form ref='form' @submit.prevent>
							<v-text-field
								v-model='user.email'
								:disabled='loading || completed'
								:error-messages='emailErrors'
								label='email'
								name='login'
								:prepend-inner-icon='mdiEmail'
								type='email'
								variant='underlined'
								@blur='touch()'
								@input='touch'
								@keyup.enter='forgot'
							/>
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
								@click='goback'
							>
								<ButtonIcon :icon='mdiClose' />
								cancel
							</v-btn>
							<v-btn
								class='elevation-0'
								:color='send_disabled?"":"secondary"'
								dark
								:disabled='send_disabled'
								large
								rounded
								:variant='send_disabled ? "outlined" : "flat"'
								@click='forgot'
							>
								send
								<ButtonIcon :icon='mdiSend' :margin='"ml-2"' />
							</v-btn>
						</div>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import { mdiClose, mdiEmail, mdiSend } from '@mdi/js'
import useVuelidate from '@vuelidate/core'
import { email, required } from '@vuelidate/validators'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { axios_incognito } from '@/services/axios'
import { snackSuccess } from '@/services/snack'

const { mdAndDown } = useDisplay()

const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})

const send_disabled = computed(() => v$.value.$invalid || loading.value || completed.value)

const emailErrors = computed((): Array<string> => {
	const errors: Array<string> = []
	if (!v$.value.user?.email?.$dirty) return errors
	if (!v$.value.user?.email?.$dirty) errors.push('email invalid')
	if (!v$.value.email?.required) errors.push('email required')
	return errors
})

const fontSize = computed(() => mdAndDown ? 'text-subtitle-1' : 'text-h5')

const completed = ref(false)
const user = ref({ email: '' })

const router = useRouter()
function touch (): void {
	v$.value.user?.email?.$touch()
}

function goback (): void {
	router.back()
}

// ALWAYS sends a forgotten password axios request, and snack success
async function forgot (): Promise<void> {
	if (v$.value.$invalid) return
	loading.value = true
	const resetRequest = await axios_incognito.resetPassword_post(user.value.email)
	if (resetRequest) snackSuccess({
		message: resetRequest,
		icon: mdiEmail,
		type: 'success',
		timeout: 15_000,
	})
	completed.value = true
	loading.value = false
}

onMounted(() => {
	const browserStore = browserModule()
	browserStore.set_pageTitle('Forgot Password')
	browserStore.set_description('Meal Pedant - Reset you user account password')
})

const rules = {
	email: {
		email,
		required,
	},
}
const v$ = useVuelidate(rules, user)

</script>
