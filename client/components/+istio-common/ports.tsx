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


interface Props<T = any> extends Partial<Props> {
    value?: T;
    name?: string;
    themeName?: "dark" | "light" | "outlined";

    onChange?(value: T, meta?: ActionMeta<any>): void;
}


export interface Lable {
    key: string,
    value: string
}

export const defaultLabel: Lable = {
    key: "",
    value: "",
}


@observer
export class PortDetails extends React.Component<Props> {


    @computed get value(): Lable[] {
        return this.props.value || [];
    }

    add = () => {
        this.value.push(defaultLabel);
    };

    remove = (index: number) => {
        this.value.splice(index, 1);
    };

    renderPortDetail(index: number) {
        return (
            <>
                <Grid container spacing={5} direction={"row"} zeroMinWidth>
                    <Grid item xs={11} direction={"row"} zeroMinWidth>
                        <Grid container spacing={1} direction={"row"} zeroMinWidth>
                            <Grid item xs={12}>
                                <Input
                                    placeholder={"key"}
                                    value={this.value[index].key}
                                    onChange={(value) => (this.value[index].key = value)}
                                />
                                <Input
                                    placeholder={"value"}
                                    value={this.value[index].value}
                                    onChange={(value) => (this.value[index].value = value)}
                                />
                            </Grid>

                        </Grid>

                    </Grid>
                    <Grid item xs zeroMinWidth>
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
                            <Trans>Ports</Trans>
              &nbsp;&nbsp;
              <Icon material={"edit"} className={"editIcon"} onClick={event => {
                                stopPropagation(event);
                                this.add()
                            }} small />
                        </>
                    }>
                </SubTitle>
                {this?.value?.map((item: any, index: number) => {
                    return this.renderPortDetail(index);
                })}
            </>
        );
    }

}
