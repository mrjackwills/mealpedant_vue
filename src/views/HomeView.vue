<template>
	<v-container class='' fluid>
		<v-row class='justify-center'>
			<v-col class='align-center text-center text-white text-headline-small' cols='12' md='8'>
				Since May 9th 2015, two friends have fastidiously exchanged information on every evening meal that they have consumed.
				<br>
				<br>
				This is a comprehensive chronicling of that pedantry.
				<br>
				<br>
			</v-col>
			<v-col class='align-center justify-center text-center' cols='12'>
				<v-btn
					class='cl'
					color='secondary'
					rounded
					size='x-large'
					:to='FrontEndRoutes.MEALS'
					variant='flat'
				>
					<v-row class='justify-center align-center' density='compact'>
						<v-col cols='auto'>
							<ButtonIcon color='white' :icon='mdiFood' size='large' />
						</v-col>
						<v-col cols='auto'>
							see the meals
						</v-col>
					</v-row>
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>
<script setup lang='ts'>
import { mdiFood } from '@mdi/js'
import { FrontEndRoutes } from '@/types/const_routes'

const browserStore = browserModule()

onMounted(() => {
	browserStore.set_pageTitle('Home')
	browserStore.set_description('Meal Pedant Home Page')
})

</script>
