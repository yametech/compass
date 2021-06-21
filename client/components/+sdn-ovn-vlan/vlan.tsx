import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";

interface Props extends RouteComponentProps {
}

@observer
export class Vlan extends React.Component<Props> {

    componentDidMount(){
     
    }

    render() {
        return (
            <>
              <h2>todo</h2>
            </>
        )
    }
}

