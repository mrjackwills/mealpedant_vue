<template>
	<v-row class='ma-0 pa-0 mb-1' align='center' justify='center'>
		<v-col cols='12' sm='10' md='8' class='ma-0 pa-0'>
			<v-row class='ma-0 pa-0' align='center'>
				<v-col :class='{ "mr-2": mdAndUp }' class='ma-0 pa-0' cols='1' sm='auto'>
					<v-icon :color='iconColor' :icon :size='smAndDown ? "small" : ""' />
				</v-col>
				<v-col cols='10' sm='auto' class='ma-0 pa-0'>
					<span class='text-h6' :class='textColor'>{{ text }}</span>
				</v-col>
				<v-spacer />
				<v-col cols='1' sm='auto' class='ma-0 pa-0 ' v-if='active'>
					<v-row justify='end' class='pa-0 ma-0'>
						<v-col cols='auto' class='pa-0 ma-0'>
							<v-btn @click='click' variant='text' size='small' icon>
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
import { mdiAlertCircle, mdiCheckCircle, mdiCloseCircle } from '@mdi/js';
import { useDisplay } from 'vuetify';
const { smAndDown, mdAndUp } = useDisplay();

const icon = computed(() => props.active ? mdiCheckCircle : mdiAlertCircle);
const iconColor = computed(() => props.active ? 'white' : 'error');
const textColor = computed(() => props.active ? 'text-white' : 'text-error');

const emit = defineEmits(['click']);

const click = (): void => {
	emit('click');
};

const props = defineProps<{
	active: boolean;
	text: string;
}>();

</script>
