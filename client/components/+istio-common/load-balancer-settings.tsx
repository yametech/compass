import { observer } from "mobx-react";
import React from "react";
import { computed, observable } from "mobx";
import { Input } from "../input";
import { ActionMeta } from "react-select/src/types";
import { SubTitle } from "../layout/sub-title";
import { Icon } from "../icon";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Grid } from "@material-ui/core";
import { stopPropagation } from "../../utils";
import {
    LoadBalancerSettings,
    LocalityLoadBalancerSetting,
    LocalityLoadBalancerSetting_Distribute,
} from "../../api/endpoints/istio-destination-rule.api"
import { HostDetails } from "./hosts"


interface Props<T = any> extends Partial<Props> {
    value?: T;
    themeName?: "dark" | "light" | "outlined";

    onChange?(value: T, meta?: ActionMeta<any>): void;
}


export interface LBPair {
    key?: string;
    value?: string;
}

export const defaultLBPair: LBPair = {
    key: "",
    value: "",
}

export interface LocalityLoadBalancerSetting_DistributeExt extends LocalityLoadBalancerSetting_Distribute {
    pairs?: LBPair[],
}

export const defaultDistribute: LocalityLoadBalancerSetting_DistributeExt = {
    from: "",
    pairs: [],
}


export interface LocalityLoadBalancerSettingExt extends LocalityLoadBalancerSetting {
    enabledStr: string
    distributeExt?: LocalityLoadBalancerSetting_DistributeExt[]
}

export const defaultLocalityLoadBalancerSetting: LocalityLoadBalancerSettingExt = {
    // dist?ribute: [],
    distributeExt: [],
    failover: [],
    enabledStr: "",
}


export const defaultLoadBalancerSetting: LoadBalancerSettings = {
    lbPolicy: "",
    localityLbSetting: defaultLocalityLoadBalancerSetting,
}


@observer
export class DistributeDetail extends React.Component<Props> {
    @computed get value(): LocalityLoadBalancerSetting_DistributeExt[] {
        return this.props.value || [];
    }
    add = () => {
        this.value.push(defaultDistribute);
    };

    remove = (index: number) => {
        this.value.splice(index, 1);
    };

    renderDistributeDetail(index: number) {
        return (
            <>
                <Grid container spacing={5} direction={"row"} zeroMinWidth>
                    <Grid item xs={11} direction={"row"} zeroMinWidth>
                        <Grid container spacing={1} direction={"row"} zeroMinWidth>
                            <Grid item xs={12}>
                                <Input
                                    placeholder={"From"}
                                    value={this.value[index].from}
                                    onChange={(value) => (this.value[index].from = value)}
                                />

                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </>
        )
    }

    render() {
        return (
            <>
                <SubTitle
                    title={
                        <>
                            <Trans>Distribute</Trans>
              &nbsp;&nbsp;
              <Icon material={"edit"} className={"editIcon"} onClick={event => {
                                stopPropagation(event);
                                this.add()
                            }} small />
                        </>
                    }>
                </SubTitle>
                {this.value.map((item: any, index: number) => {
                    return this.renderDistributeDetail(index);
                })}
            </>
        );
    }

}


@observer
export class LoadBalancerSetting extends React.Component<Props> {


    @computed get value(): LoadBalancerSettings {
        return this.props.value || defaultLoadBalancerSetting;
    }


    // get typeOptions() {
    //     return ["true", "false"];
    // }

    // add = () => {
    //     this.value.push(defaultLoadBalancerSetting);
    // };

    // remove = (index: number) => {
    //     this.value.splice(index, 1);
    // };

    renderLoadBalancerSetting() {
        return (
            <>
                <Grid container spacing={5} direction={"row"} zeroMinWidth>
                    <Grid item xs={11} direction={"row"} zeroMinWidth>
                        <Grid container spacing={1} direction={"row"} zeroMinWidth>
                            <Grid item xs={12}>
                                <Input
                                    placeholder={"LbPolicy"}
                                    value={this.value.lbPolicy}
                                    onChange={(value) => (this.value.lbPolicy = value)}
                                />


                            </Grid>
                        </Grid>




                    </Grid>
                    {/* <Grid item xs zeroMinWidth>
                        <Icon
                            small
                            tooltip={_i18n._(t`Remove`)}
                            className="remove-icon"
                            material="clear"
                            onClick={(event) => {
                                this.remove(index);
                                stopPropagation(event)
                            }}
                        />
                    </Grid> */}
                </Grid>
            </>
        )
    }


    render() {
        return (
            <>
                {/* <SubTitle
                    title={
                        <>
                            <Trans>LoadBalancerSetting</Trans>
              &nbsp;&nbsp;
              <Icon material={"edit"} className={"editIcon"} onClick={event => {
                                stopPropagation(event);
                                this.add()
                            }} small />
                        </>
                    }>
                </SubTitle> */}
                {/* {this.value.map((item: any, index: number) => {
                    return this.renderLoadBalancerSetting(index);
                })} */}
                {
                    this.renderLoadBalancerSetting()
                }
            </>
        );
    }

}
