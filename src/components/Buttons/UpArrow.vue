<template>
	<transition mode='out-in' name='fade'>
		<v-btn
			v-if='scrolled'
			v-tooltip:top='"Scroll to top"'
			class='mr-1 cl up_arrow'
			color='error'
			dark
			:icon='mdiArrowCollapseUp'
			position='fixed'
			size='small'
			@click='goToTop'
		/>
	</transition>
</template>

<script setup lang='ts'>
import { mdiArrowCollapseUp } from '@mdi/js'

onMounted(() => {
	window.addEventListener('scroll', scrollEvent)
})

onBeforeUnmount(() => {
	window.removeEventListener('scroll', scrollEvent)
})

const scrolled = ref(false)

function scrollEvent (): void {
	scrolled.value = window.scrollY > 200 ? true : false
}

function goToTop (): void {
	window.scrollTo({
		top: 0,
		behavior: 'smooth',
	})
}
</script>

<style scoped>
.up_arrow {
	/* inset: 0 1rem 1rem 0; */
	right: 1rem;
	bottom: 1rem;
	z-index: 1005;
}
</style>
