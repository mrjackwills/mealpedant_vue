<template>
	<v-container fluid class=''>
		<v-row align='center' justify='center'>
			<v-col cols='11' align='center' >
				<p class='text-white text-h5'>
					Since May 9th 2015, two friends have fastidiously exchanged information on every evening meal that they have consumed.
				</p>
				<p class='text-center text-white text-h5 my-4'>
					This is a comprehensive chronicling of that pedantry.
				</p>
			</v-col>
			<v-col cols='11' align='center' justify='center'>
				<v-btn :to='FrontEndRoutes.MEALS' color='secondary' class='cl' size='x-large' variant='flat' rounded>
					<v-row align='center' justify='center'>
						<v-col cols='auto' class='pa-1'>
							<ButtonIcon :icon='mdiFood' color='white' size='large' />
						</v-col>
						<v-col cols='auto' class='pa-1'>
							see the meals
						</v-col>
					</v-row>
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>
<script setup lang='ts'>
import { FrontEndRoutes } from '@/types/const_routes';
import { mdiFood } from '@mdi/js';

const browserStore = browserModule();

onMounted(() => {
	browserStore.set_pageTitle('Home');
	browserStore.set_description('Meal Pedant Home Page');
});

</script>
