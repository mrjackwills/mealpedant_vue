<template>
	<v-container fluid class='ma-0 pa-0 no-gutters fill-height'>
		<v-row align='center' justify='center'>
			<v-col cols='10' class='cl text-h3 text-center text-white'>
				Error - page not found
			</v-col>
			<v-col cols='10' align='center' justify='center'>
				<v-btn :to='FrontEndRoutes.BASE' color='error' class='cl' size='x-large' variant='flat' rounded>
					<v-row align='center' justify='center'>
						<v-col cols='auto' class='pa-1'>
							<ButtonIcon :icon='mdiHome' color='white' size='large' />
						</v-col>
						<v-col cols='auto' class='pa-1'>
							<div>Return to home page</div>
						</v-col>
					</v-row>
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import { FrontEndRoutes } from '@/types/const_routes';
import { mdiHome } from '@mdi/js';

onMounted(() => {
	const browserStore = browserModule();
	browserStore.set_pageTitle('Error');
	browserStore.set_description('The page that you are looking for cannot be found, are you sure the address is correct');
});

</script>
