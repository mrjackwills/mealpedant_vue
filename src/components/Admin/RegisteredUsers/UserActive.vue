<template>
	<v-row justify='start' align='center' class='ma-0 pa-0'>
		<v-col cols='auto' class='ma-0 pa-0'>
			<v-switch v-model='newActive' :color='newActive ? "mealtype" : ""' :disabled='disabled || readOnly'
				:readonly='readOnly' class='ma-0 pa-0 mb-n6' />
		</v-col>
	</v-row>
	<v-expand-x-transition>
		<v-row justify='start' align='center' class='ma-0 pa-0'>
			<v-col cols='auto' class='ma-0 pa-0 heartbeat' v-if='showSave'>
				<v-btn @click='save' class='ma-0 pa-0' size='small' variant='text' fab>
					<v-icon size='small' color='secondary' :icon='mdiContentSave' />
				</v-btn>
			</v-col>
		</v-row>
	</v-expand-x-transition>
</template>

<script setup lang='ts'>
import { axios_admin } from '@/services/axios';
import type { PV } from '@/types';
import { mdiContentSave } from '@mdi/js';

const disabled = computed((): boolean => props.removeOnly && !props.active ? true : false);
const showSave = computed((): boolean => props.removeOnly ? !newActive.value && newActive.value !== props.active : newActive.value !== props.active);
const newActive = ref(false as boolean);

const save = async (): PV => {
	if (props.patchName) {
		switch (props.patchName) {
			case 'active':
				await axios_admin.user_patch({
					patch: { active: newActive.value },
					email: props.email
				});
				break;

			case 'two_fa_secret':
				await axios_admin.user_patch({
					patch: { two_fa_secret: newActive.value },
					email: props.email
				});
				break;
		}
		await axios_admin.user_get();
	}
};

onBeforeMount(() => {
	newActive.value = props.active;
});

const props = withDefaults(defineProps<{
	active?: boolean;
	email: string;
	removeOnly?: boolean;
	patchName?: 'active' | 'two_fa_secret';
	readOnly?: boolean;
}>(), {
	removeOnly: false,
	readOnly: false
});

</script>
