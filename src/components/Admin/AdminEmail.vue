<template>
	<v-row justify='center'>
		<v-col cols='12' grow md='6' sm='8'>
			<v-form @submit.prevent>
				<v-row class='no-gutters' justify='space-between' wrap>
					<v-col class='ma-0 pa-0' cols='9'>
						<v-select
							v-model='email.emails'
							chips
							clearable
							:disabled='confirm'
							:error-messages='errorMessages.emails'
							hint='send to'
							:items='emailAddresses'
							label='email address'
							multiple
							:prepend-inner-icon='mdiEmail'
							variant='underlined'
							@blur='touch(`emails`)'
							@input='touch(`emails`)'
						/>
					</v-col>
					<v-col class='ma-0 pa-0 mt-4' cols='auto' justify='end'>
						<v-switch
							v-model='all'
							color='primary'
							density='compact'
							:disabled='confirm'
							label='all'
							@change='allToggle()'
						/>
					</v-col>
					<v-col v-for='(item, index) in lineRows' :key='index' class='ma-0 pa-0' cols='12'>
						<v-textarea
							v-model='email[item.model]'
							:auto-grow='true'
							clearable
							:disabled='confirm'
							:error='errors[item.name]'
							:error-messages='errorMessages[item.name]'
							:label='item.label'
							:name='item.name'
							:prepend-inner-icon='item.icon'
							rows='1'
							variant='underlined'
							@blur='touch(item.name)'
							@input='touch(item.name)'
						/>
					</v-col>
				</v-row>
			</v-form>

			<v-row justify='space-around'>
				<v-col class='mt-3' cols='auto'>
					<div class='text-center'>
						<v-btn
							class='elevation-0'

							:color='localLoading || errors.button_text || errors.link || buttonAndLink || v$.$invalid ? "black" : computedSendColor'
							:disabled='localLoading || errors.button_text || errors.link || buttonAndLink || v$.$invalid'
							rounded
							size='large'
							:variant='localLoading || errors.button_text || errors.link || buttonAndLink || v$.$invalid ? "outlined" : "flat"'
							@click='sendButton'
						>
							<ButtonIcon
								:color='localLoading || errors.button_text || errors.link || buttonAndLink || v$.$invalid ? "black" : ""'
								:icon='computedSendIcon'
							/>
							{{ computedSendtext }}
						</v-btn>
					</div>
				</v-col>
				<v-col v-if='confirm' class='mt-3' cols='auto'>
					<div class='text-center'>
						<v-btn
							class='elevation-0'
							:color='localLoading || disabled || errors.button_text || errors.link || buttonAndLink ? "black" : "primary"'
							:disabled='localLoading || disabled || errors.button_text || errors.link || buttonAndLink'
							rounded
							size='large'
							:variant='localLoading || disabled || errors.button_text || errors.link || buttonAndLink ? "outlined" : "flat"'
							@click='confirmButton'
						>
							<ButtonIcon v-if='!countdown' color='black' :icon='mdiEmail' />
							<span v-if='countdown' class='mr-1 monospacetext'>({{ countdown }})</span> Confirm
						</v-btn>
					</div>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import type { PV, su } from '@/types'
import { mdiClose, mdiCommentTextMultipleOutline, mdiCommentTextOutline, mdiEmail, mdiFormatTitle, mdiLink, mdiTagTextOutline } from '@mdi/js'
import useVuelidate from '@vuelidate/core'
import { minLength, required } from '@vuelidate/validators'
import { axios_admin } from '@/services/axios'
import { snackSuccess } from '@/services/snack'

onBeforeUnmount(() => {
	clearTimeout(disabledTimeout.value)
	clearInterval(countdownInterval.value)
})

const buttonAndLink = computed(() => (email.value.button_text && email.value.link) || (!email.value.button_text && !email.value.link) ? false : true)
const computedSendColor = computed(() => confirm.value ? 'error' : 'secondary')
const computedSendIcon = computed(() => confirm.value ? mdiClose : mdiEmail)
const computedSendtext = computed(() => confirm.value ? 'cancel' : 'send')
const emailAddresses = computed(() => adminModule().email)

const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})

const watcher_button_text = computed((): su => email.value.button_text)
const watcher_title = computed((): su => email.value.title)
const watcher_line_one = computed((): su => email.value.line_one)
const watcher_link = computed((): su => email.value.link)
const watch_emails = computed((): undefined | Array<string> => email.value.emails)

const all = ref(false)
const confirm = ref(false)
const countdown = ref(0)
const countdownInterval = ref(0)
const email = ref({
	emails: [] as Array<string>,
	title: '',
	line_one: '',
	line_two: undefined as su,
	button_text: undefined as su,
	link: undefined as su,
})
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
const errorMessages = ref({
	emails: undefined as su,
	title: undefined as su,
	line_one: undefined as su,
	line_two: undefined as su,
	button_text: undefined as su,
	link: undefined as su,
})
const errors = ref({
	emails: false,
	title: false,
	line_one: false,
	line_two: false,
	button_text: false,
	link: false,
})
const disabled = ref(true)
const disabledTimeout = ref(0)
const lineRows = [
	{
		icon: mdiFormatTitle,
		model: 'title',
		name: 'title',
		hint: 'title',
		label: 'email title',
		type: 'text',
	},
	{
		icon: mdiCommentTextOutline,
		model: 'line_one',
		name: 'line_one',
		hint: 'line one',
		label: 'line one',
		type: 'text',
	},
	{
		icon: mdiCommentTextMultipleOutline,
		model: 'line_two',
		name: 'line_two',
		hint: 'line two',
		label: 'line two',
		type: 'text',
	},
	{
		icon: mdiTagTextOutline,
		model: 'button_text',
		name: 'button_text',
		hint: 'button text',
		label: 'button text',
		type: 'text',
	},
	{
		icon: mdiLink,
		model: 'link',
		name: 'link',
		hint: 'button link',
		label: 'button hyperlink',
		type: 'text',
	},
] as const
const localLoading = ref(false)

function allToggle (): void {
	email.value.emails = all.value ? emailAddresses.value : []
}

async function confirmButton (): PV {
	if (v$.value.$invalid || errors.value.button_text || errors.value.link || email.value.emails?.length === 0 || !email.value.title || !email.value.line_one) return
	// Still not happy with this
	loading.value = true
	localLoading.value = true
	for (const i of email.value.emails) if (!emailRegex.test(i)) throw new Error(`Email address invalid - ${i}`)
	const response = await axios_admin.email_post(email.value)
	if (response) {
		const emailPlural = email.value.emails.length > 1 ? 's have' : ' has'
		snackSuccess({
			message: `the email${emailPlural} been sent`,
			icon: mdiEmail,
			type: 'success',
		})
		v$.value.$reset()
		email.value = {
			emails: [],
			title: '',
			line_one: '',
			line_two: undefined,
			button_text: undefined,
			link: undefined,
		}
	}
	[loading.value, localLoading.value, confirm.value, disabled.value] = [false, false, false, false]
}
function sendButton (): void {
	disabled.value = true
	confirm.value = !confirm.value
	if (confirm.value) {
		countdown.value = 5
		disabledTimeout.value = window.setTimeout(() => {
			disabled.value = false
		}, 5000)
		countdownInterval.value = window.setInterval(() => {
			if (countdown.value > 0) countdown.value -= 1
			if (countdown.value === 0) clearInterval(countdownInterval.value)
		}, 1000)
	} else {
		clearInterval(countdownInterval.value)
		clearTimeout(disabledTimeout.value)
		disabled.value = true
	}
}
function touch (name: string): void {
	v$.value[name]?.$touch()
}

const rules = {
	emails: { required },
	line_one: {
		required,
		minLen: minLength(10),
	},
	title: {
		required,
		minLen: minLength(10),
	},
	line_two: {},
	button_text: {},
	link: {},
}
const v$ = useVuelidate(rules, email)

watch(watch_emails, () => {
	if (email.value.emails?.length === emailAddresses.value.length) all.value = true
	if (email.value.emails?.length === 0) all.value = false
})

watch(watcher_button_text, (i: su) => {
	if (!i && !email.value.link) {
		errors.value.link = false
		errors.value.button_text = false
		delete errorMessages.value.button_text
		delete errorMessages.value.link
		return
	} else if (i && !email.value.link) errorMessages.value.link = 'Link required'
	else if (!i && email.value.link) errorMessages.value.button_text = 'Button text required'
	else if (i) {
		if (errorMessages.value.link === 'Button text required') {
			errors.value.link = false
			errorMessages.value.link = undefined
		}
		delete errorMessages.value.button_text
		errors.value.button_text = false
	}
})

watch(watcher_link, (i: su) => {
	if (i) email.value.link = i.toLowerCase().trim()

	if (!i && !email.value.button_text) {
		delete errorMessages.value.button_text
		errors.value.link = false
		errors.value.button_text = false
		delete errorMessages.value.link
		return
	}
	if (!i && email.value.button_text) {
		errors.value.link = true
		errorMessages.value.button_text = 'Link required'
		return
	}
	const domainRegex = /^http(s)?:\/\/([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}(\/.*)?$/
	if (!i) return
	const regexTest = domainRegex.test(i)
	if (i && !regexTest) {
		errors.value.link = true
		errorMessages.value.link = 'invalid link'
	}
	if (regexTest && !email.value.button_text) {
		errors.value.link = true
		errorMessages.value.button_text = 'Button text required'
	}
	if (regexTest) {
		errors.value.link = false
		delete errorMessages.value.link
	}
})

watch(watcher_title, () => {
	if (!v$.value.title?.$invalid) delete errorMessages.value.title
	else if (!v$.value.title?.$dirty) return
	else if (!v$.value.title?.required) errorMessages.value.title = 'Email title invalid'
	else if (!v$.value.title?.minLength) errorMessages.value.title = '12 characters minimum'
})

watch(watcher_line_one, (i: su) => {
	if (!i) v$.value.line_one?.$reset()
	else if (!v$.value.line_one?.$invalid) delete errorMessages.value.line_one
	else if (!v$.value.line_one?.$dirty) return
	else if (!v$.value.line_one?.required) errorMessages.value.line_one = 'Line one invalid'
	else if (!v$.value.line_one?.minLength) errorMessages.value.line_one = '12 characters minimum'
})

</script>
