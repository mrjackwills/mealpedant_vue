<template>
	<v-container class='ma-0 pa-0 no-gutters fill-height' fluid>
		<v-row align='center' justify='center'>
			<v-col class='cl text-h3 text-center text-white' cols='10'>
				Error - page not found
			</v-col>
			<v-col align='center' cols='10' justify='center'>
				<v-btn
					class='cl'
					color='error'
					rounded
					size='x-large'
					:to='FrontEndRoutes.BASE'
					variant='flat'
				>
					<v-row align='center' justify='center'>
						<v-col class='pa-1' cols='auto'>
							<ButtonIcon color='white' :icon='mdiHome' size='large' />
						</v-col>
						<v-col class='pa-1' cols='auto'>
							<div>Return to home page</div>
						</v-col>
					</v-row>
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import { mdiHome } from '@mdi/js'
import { FrontEndRoutes } from '@/types/const_routes'

onMounted(() => {
	const browserStore = browserModule()
	browserStore.set_pageTitle('Error')
	browserStore.set_description('The page that you are looking for cannot be found, are you sure the address is correct')
})

</script>
