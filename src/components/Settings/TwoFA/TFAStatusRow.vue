<template>
	<v-row align='center' class='ma-0 pa-0 mb-1' justify='center'>
		<v-col class='ma-0 pa-0' cols='12' md='8' sm='10'>
			<v-row align='center' class='ma-0 pa-0'>
				<v-col class='ma-0 pa-0' :class='{ "mr-2": mdAndUp }' cols='1' sm='auto'>
					<v-icon :color='iconColor' :icon :size='smAndDown ? "small" : ""' />
				</v-col>
				<v-col class='ma-0 pa-0' cols='10' sm='auto'>
					<span class='text-h6' :class='textColor'>{{ text }}</span>
				</v-col>
				<v-spacer />
				<v-col v-if='active' class='ma-0 pa-0 ' cols='1' sm='auto'>
					<v-row class='pa-0 ma-0' justify='end'>
						<v-col class='pa-0 ma-0' cols='auto'>
							<v-btn icon size='small' variant='text' @click='click'>
								<v-icon color='white' :icon='mdiCloseCircle' />
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { mdiAlertCircle, mdiCheckCircle, mdiCloseCircle } from '@mdi/js'
import { useDisplay } from 'vuetify'
const { smAndDown, mdAndUp } = useDisplay()

const icon = computed(() => props.active ? mdiCheckCircle : mdiAlertCircle)
const iconColor = computed(() => props.active ? 'white' : 'error')
const textColor = computed(() => props.active ? 'text-white' : 'text-error')

const emit = defineEmits(['click'])

function click (): void {
	emit('click')
}

const props = defineProps<{
	active: boolean
	text: string
}>()

</script>
