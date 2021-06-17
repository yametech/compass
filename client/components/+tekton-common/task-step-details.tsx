import { observer } from 'mobx-react';
import React from 'react';
import { computed } from 'mobx';
import { Input } from '../input';
import {
	ArgsDetails,
	CommandDetails,
	EvnVarDetails,
} from '../+deploy-container';
import { taskStep } from './common';
import { SubTitle } from '../layout/sub-title';
import { _i18n } from '../../i18n';

interface Props<T = any> extends Partial<Props> {
	value?: T;
	themeName?: 'dark' | 'light' | 'outlined';

	onChange?(value: T): void;
}

@observer
export class TaskStepDetails extends React.Component<Props> {
	@computed get value() {
		return this.props.value || taskStep;
	}

	render() {
		return (
			<>
				<SubTitle title={'StepName'} />
				<Input
					placeholder={'StepName'}
					value={this.value.name}
					onChange={(value) => (this.value.name = value)}
				/>
				<SubTitle title={'Image'} />
				<Input
					placeholder={'Image'}
					value={this.value.image}
					onChange={(value) => (this.value.image = value)}
				/>
				<SubTitle title={'Working Directory'} />
				<Input
					placeholder={_i18n._('Working Directory')}
					value={this.value.workingDir}
					onChange={(value) => (this.value.workingDir = value)}
				/>
				<br />
				<CommandDetails
					value={this.value.command}
					onChange={(value) => (this.value.command = value)}
				/>
				<ArgsDetails
					value={this.value.args}
					onChange={(value) => (this.value.args = value)}
				/>
				<EvnVarDetails
					value={this.value.env}
					onChange={(value) => (this.value.env = value)}
				/>
			</>
		);
	}
}
