<template>
	<v-icon :class='margin' :color :icon :size style='vertical-align: middle;' />
</template>

<script setup lang='ts'>
import { mdiCheck } from '@mdi/js';
import { useDisplay } from 'vuetify';
const { mdAndDown } = useDisplay();

const size = computed(() => props.xsmall ? 'x-small' : props.small || mdAndDown.value ? 'small' : '');

const props = withDefaults(defineProps<{
	icon: string;
	color?: string;
	small?: boolean;
	margin?: string;
	xsmall?: boolean;
}>(), {
	icon: mdiCheck,
	color: 'white',
	small: false,
	margin: 'mr-2',
	xsmall: false
});

</script>
