import "./book-tabs.scss";
import React from "react";
import { cssNames } from "../../utils";

interface stateProps {
  isExpand: boolean,
  activedName: string,
  timer: number
}

interface childProps {
  children: React.ReactNode,
  className: string
}

interface TabsProps {
  props: childProps
}

export class BookTabs extends React.Component {
  private contentElem: HTMLElement;
  
  state: stateProps = {
    isExpand: false,
    activedName: 'Home',
    timer: 0
  }

  onClickOutside = (evt: MouseEvent) => {
    const clickedElem = evt.target as HTMLElement;
    if (evt.defaultPrevented) {
      return;
    }
    const isOutsideAnyDrawer = !clickedElem.closest('.tab-chunk');
    if (isOutsideAnyDrawer) {
      this.setState({
        isExpand: false
      });
      this.clearTimeout();
    }
  }

  clearTimeout = () => {
    window.clearTimeout(this.state.timer);
  }

  componentDidMount() {
    window.addEventListener("click", this.onClickOutside)
  }

  componentWillUnmount() {
    this.clearTimeout();
    window.removeEventListener("click", this.onClickOutside)
  }

  clickArrow = (name: string) => {
    this.setState({
      isExpand: true,
      activedName: name
    })
    this.clearTimeout();
    this.state.timer = window.setTimeout(() => {
      this.setState({
        isExpand: false
      })
    }, 3000)
  }

  render () {
    const { children } = this.props;
    const { activedName, isExpand, timer } = this.state;
    return (
      <div className="book-tabs" ref={e => this.contentElem = e}>
        <div className="tab-chunk">
          <div className="chunk active" onClick={() => this.clickArrow(activedName)}>{activedName}</div>
        </div>
        <div className={cssNames("tab-chunk slide-chunk", { hide: !isExpand, firstClick: timer === 0 })}>
          {React.Children.map(children, (item: React.PropsWithChildren<TabsProps>, index: number) => {
            let tabName = item.props.className;
            return (
              <div
                key={`tabs_key${index}`}
                className={cssNames("chunk", { active: activedName === tabName })}
                onClick={() => this.clickArrow(tabName)}>
                {tabName}
              </div>
            )
          })}
        </div>
        {React.Children.map(children, (item: React.PropsWithChildren<TabsProps>, index: number) => {
          if (item.props.className !== activedName) {
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
