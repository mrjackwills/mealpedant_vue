<template>
	<transition name='fade' mode='out-in'>
		<v-btn v-if='scrolled' @click='goToTop' color='error' class='mr-1 cl up_arrow' position='fixed' size='small'
			v-tooltip:top='"Scroll to top"' :icon='mdiArrowCollapseUp' dark />
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
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	});
};
</script>

<style scoped>
.up_arrow {
	/* inset: 0 1rem 1rem 0; */
	right: 1rem;
	bottom: 1rem;
	z-index: 1005;
}
</style>
