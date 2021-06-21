import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Redirect, Route, Switch } from 'react-router';
import { MainLayout, TabRoute } from '../layout/main-layout';
import { Trans } from '@lingui/macro';
import { namespaceStore } from '../+namespaces/namespace.store';
import { Pipelines } from '../+tekton-pipeline';
import { PipelineRuns } from '../+tekton-pipelinerun';
import { PipelineResources } from '../+tekton-pipelineresource';
import { WebHook } from '../+tekton-webhook';
import { TektonsOverview } from '../+tekton-overview/tekton-overview';
import {
	pipelineURL,
	pipelineRoute,
	pipelineRunURL,
	pipelineRunRoute,
	pipelineResourceURL,
	pipelineResourceRoute,
	opsSecretURL,
	opsSecretRoute,
	webHookURL,
	webHookRoute,
	tektonsURL,
	tektonsRoute,
} from './tekton.route';
import { TektonConfg } from '../+tekton-config';

interface Props extends RouteComponentProps {}

export class Tekton extends React.Component<Props> {
	static get tabRoutes(): TabRoute[] {
		const query = namespaceStore.getContextParams();
		return [
			{
				title: <Trans>Overview</Trans>,
				component: TektonsOverview,
				url: tektonsURL({ query }),
				path: tektonsRoute.path,
			},
			{
				title: <Trans>Pipeline</Trans>,
				component: Pipelines,
				url: pipelineURL({ query }),
				path: pipelineRoute.path,
			},
			{
				title: <Trans>PipelineRun</Trans>,
				component: PipelineRuns,
				url: pipelineRunURL({ query }),
				path: pipelineRunRoute.path,
			},
			{
				title: <Trans>PipelineResource</Trans>,
				component: PipelineResources,
				url: pipelineResourceURL({ query }),
				path: pipelineResourceRoute.path,
			},
			{
				title: <Trans>Config</Trans>,
				component: TektonConfg,
				url: opsSecretURL({ query }),
				path: opsSecretRoute.path,
			},
			{
				title: <Trans>WebHook</Trans>,
				component: WebHook,
				url: webHookURL({ query }),
				path: webHookRoute.path,
			},
		];
	}

	render() {
		const tabRoutes = Tekton.tabRoutes;
		return (
			<MainLayout tabs={tabRoutes}>
				<Switch>
					{tabRoutes.map((route, index) => (
						<Route key={index} {...route} />
					))}
					<Redirect to={tabRoutes[0].url} />
				</Switch>
			</MainLayout>
		);
	}
}
