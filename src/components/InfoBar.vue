<template>
	<v-row align='center' class='pa-0 ma-0' justify='center'>
		<v-col class='pa-0 ma-1' cols='12' md='6'>
			<v-alert class='pa-0 ma-0 pa-3' :color>
				<v-row align='center' class='ma-0 pa-0' justify='space-between'>
					<v-col class='pa-0 ma-0' cols='1' lg='auto'>
						<v-icon color='white' :icon='mdiInformation' small />
					</v-col>
					<v-col class='text-white pa-0 ma-0 text-center text-overline' cols='10' lg='auto'>
						{{ message }}
					</v-col>
					<v-col class='pa-0 ma-0' cols='1' lg='auto'>
						<v-icon color='white' :icon='mdiClose' small @click='infoClose' />
					</v-col>
				</v-row>
			</v-alert>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { mdiClose, mdiInformation } from '@mdi/js'

function infoClose (): void {
	infobarModule().remove_message(props.message)
}

const props = withDefaults(defineProps<{
	message: string
	color?: string
}>(), { color: 'secondary' })
</script>
