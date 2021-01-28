import "./book-tabs.scss";
import React from "react";
import { cssNames, stopPropagation, prevDefault } from "../../utils";
import { Icon } from "../icon";
import { Tooltip } from '@material-ui/core';

interface stateProps {
  activedName: string
}

interface childProps {
  children: React.ReactNode,
  className: string,
  name: string
}

interface TabsProps {
  props: childProps
}

interface NodeProps {
  name: string,
  iconName?: string,
  className?: string,
}

export class BookTabsNode extends React.Component<NodeProps> {
  render () {
    const { children } = this.props;
    return (
      <div>
        {children}
      </div>
    );
  }
}

export class BookTabs extends React.Component {
  private contentElem: HTMLElement;
  
  state: stateProps = {
    activedName: 'Home'
  }

  clickArrow = (name: string) => {
    this.setState({
      activedName: name
    }, () => {
      let ele = this.contentElem.parentNode.parentNode as any;
      ele.scrollTop = 0;
    });
  }

  render () {
    const { children } = this.props;
    const { activedName } = this.state;
    return (
      <div className="book-tabs" ref={e => this.contentElem = e}>
        <div className="tab-chunk slide-chunk">
          {React.Children.map(children, (item: any, index: number) => {
            let tabName = item.props.name;
            let iconName = item.props.iconName;
            return (
              <Tooltip arrow title={tabName} placement="right">
                <div
                  key={`tabs_key${index}`}
                  className={cssNames("chunk", { active: activedName === tabName })}
                  onClick={(event) => {
                    this.clickArrow(tabName);
                  }}>
                    <Icon material={iconName} />
                </div>
              </Tooltip>
            )
          })}
        </div>
        {React.Children.map(children, (item: React.PropsWithChildren<TabsProps>, index: number) => {
          if (item.props.name !== activedName) {
            return null
          }
          return (
            <div key={`content_key${index}`}>
              {item.props.children}
            </div>
          );
        })}
      </div>
    );
  }
}
