<template>
	<transition
		name='fade'
		mode='out-in'
	>
		<v-btn
			v-if='scrolled'
			@click='goToTop'
			color='error'
			class='mr-1 cl up_arrow'
			position='fixed'
			size='small'
			:icon='mdiArrowCollapseUp'
			dark
		/>
	</transition>
</template>

<script setup lang='ts'>
import { mdiArrowCollapseUp } from '@mdi/js';

onMounted(() => {
	window.addEventListener('scroll', scrollEvent);
});

onBeforeUnmount(() => {
	window.removeEventListener('scroll', scrollEvent);
});

const scrolled = ref(false);

const scrollEvent = (): void => {
	scrolled.value = window.scrollY > 200 ? true : false;
};

const goToTop = (): void => {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
};
</script>

<style scoped>
.up_arrow{
	/* inset: 0 1rem 1rem 0; */
	right: 1rem;
	bottom: 1rem;
	z-index: 1005;
}
</style>