<template>
	<v-container class='' fluid>
		<v-row align='center' justify='center'>
			<v-col align='center' cols='11'>
				<p class='text-white text-h5'>
					Since May 9th 2015, two friends have fastidiously exchanged information on every evening meal that they have consumed.
				</p>
				<p class='text-center text-white text-h5 my-4'>
					This is a comprehensive chronicling of that pedantry.
				</p>
			</v-col>
			<v-col align='center' cols='11' justify='center'>
				<v-btn
					class='cl'
					color='secondary'
					rounded
					size='x-large'
					:to='FrontEndRoutes.MEALS'
					variant='flat'
				>
					<v-row align='center' justify='center'>
						<v-col class='pa-1' cols='auto'>
							<ButtonIcon color='white' :icon='mdiFood' size='large' />
						</v-col>
						<v-col class='pa-1' cols='auto'>
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
