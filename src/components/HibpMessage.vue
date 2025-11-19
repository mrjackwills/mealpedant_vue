<template>
	<div class='text-center text-error font-weight-medium ' :class='pSize'>
		<span class='text-uppercase'>This password is unsafe</span>
		<br>It appears in a database of leaked passwords. Try using a password which is a complex combination of
		letters, numbers, and symbols, and ideally utilise password manager.
		<br>
		<a
			class='text-caption text-white'
			href='https://haveibeenpwned.com/Passwords'
			rel='noopener noreferrer'
			target='_blank'
		>
			(password checking powered by hipb
			<v-icon :icon='mdiOpenInNew' style='vertical-align: middle;' x-small />)
		</a>
	</div>
</template>

<script setup lang='ts'>
import { mdiOpenInNew } from '@mdi/js'
import { useDisplay } from 'vuetify'
const { mdAndDown } = useDisplay()

const pSize = computed(() => mdAndDown ? 'text-caption' : 'text-body-2')
</script>
