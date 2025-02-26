<template>
	<div class='text-center error--text font-weight-medium ' :class='pSize'>
		<span class='text-uppercase'>This password is unsafe</span>
		<br>It appears in a database of leaked passwords. Try using a password which is a complex combination of letters, numbers, and symbols, and ideally utilise password manager.
		<br>
		<a href='https://haveibeenpwned.com/Passwords' target='_blank' rel='noopener noreferrer' class='text-caption white--text'>
			(password checking powered by hipb
			<v-icon x-small style='vertical-align: middle;' :icon='mdiOpenInNew' />)
		</a>
	</div>
</template>

<script setup lang='ts'>
import { mdiOpenInNew } from '@mdi/js';
import { useDisplay } from 'vuetify';
const { mdAndDown } = useDisplay();

const pSize = computed((): string => {
	return mdAndDown ? 'text-caption' : 'text-body-2';
}
);
</script>