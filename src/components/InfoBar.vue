<template>
	<v-row align='center' justify='center' class='pa-0 ma-0'>
		<v-col cols='12' md='6' class='pa-0 ma-1'>
			<v-alert class='pa-0 ma-0 pa-3' :color='color'>
				<v-row justify='space-between' align='center' class='ma-0 pa-0'>
					<v-col cols='1' lg='auto' class='pa-0 ma-0'>
						<v-icon small color='white' :icon='mdiInformation' />
					</v-col>
					<v-col cols='10' lg='auto' class='text-white pa-0 ma-0 text-center text-overline'>
						{{ message }}
					</v-col>
					<v-col cols='1' lg='auto' class='pa-0 ma-0'>
						<v-icon @click='infoClose' :icon='mdiClose' color='white' small />
					</v-col>
				</v-row>
			</v-alert>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { mdiClose, mdiInformation } from '@mdi/js';

const infoClose = (): void => {
	infobarModule().remove_message(props.message);
};

const props = withDefaults(defineProps<{
	message: string;
	color?: string;
}>(), { color: 'secondary' });
</script>