<template>
	<v-row align='center' justify='center' class='pa-0 ma-0'>
		<v-col cols='12' sm='7' md='4' class='pa-0 ma-1'>
			<v-alert
				class='pa-0 ma-0 py-2'
				:color='color'
			>
				<v-row justify='space-around' align='center' class='ma-0 pa-0'>
					<v-col cols='auto' class='pa-0 ma-0'>
						<v-icon small color='white' :icon='mdiInformation' />
					</v-col>
					<v-col cols='auto' class='white--text pa-0 ma-0 px-2' >
						<div class='text-overline'>{{ message }}</div>
					</v-col>
					<v-col cols='auto' class='pa-0 ma-0'>
						<v-icon
							@click='infoClose'
							:icon='mdiClose'
							color='white'
							small
						/>
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
	message: string,
	color?: string,
}>(), {
	color: 'secondary',
});
</script>