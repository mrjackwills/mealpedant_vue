<template>
	<v-container fluid class='ma-0 pa-0 no-gutters fill-height' >
		<v-row align='center' justify='center' >
			<v-col cols='12' @click='goHome' class='cl text-center text-white'>
				<div
					v-for='(item,index) in rows'
					:class='item.class'
					:key='index'
				>
					{{ item.text }}
				</div>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import { FrontEndRoutes } from '@/types/enum_routes';
const rows = [
	{
		class: 'text-h5',
		text: 'page not found'
	},
	{
		class: 'text-h1 pulse',
		text: 'Error'
	},
	{
		class: 'text-h5',
		text: 'return to home page'
	}

];

onMounted(() => {
	const browserStore = browserModule();
	browserStore.set_pageTitle('Error');
	browserStore.set_description('The page that you are looking for cannot be found, are you sure the address is correct');
});

const router = useRouter();
const goHome = (): void => {
	router.push(FrontEndRoutes.BASE);
};
</script>
