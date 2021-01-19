import React from "react"
import { computed, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Icon } from "../icon";
import { cssNames } from "../../utils";
import { Button, Popover } from "@material-ui/core";
import { navigation, setQueryParams } from "../../navigation";
import { deployStore } from "../+workloads-deploy/deploy.store";
import "./page-filters-tag.scss"

interface tagState {
  name: string,
  active?: boolean,
  count?: number 
}
interface initState {
  isOpen: boolean,
  anchorEl: HTMLElement,
  tagArr: tagState[]
}

interface Props {}

@observer
export class PageFiltersTag extends React.Component<Props> {

  state: initState = {
    isOpen: false,
    anchorEl: null,
    tagArr: []
  }

  constructor(props: Props) {
    super(props);
    disposeOnUnmount(this, [
      reaction(() => this.getFilter, () => {
        this.setState({
          tagArr: this.getFilter
        })
      })
    ]);
  }
  
  componentDidMount() {
    this.setState({
      tagArr: this.getFilter
    })
  }
  
  @computed get getFilter() {
    return deployStore.items?.reduce((pre, next) => {
      let tag = next.metadata?.labels?.tagName
      if (!tag) return pre
      let isExist = false
      pre.forEach(item => {
        if (item.name === tag) {
          item.count++
          isExist = true
        }
      })
      if (!isExist) {
        let tagObject: tagState = { name: tag, active: this.getTagName === tag, count: 1 }
        pre.push(tagObject)
      }
      return pre
    }, []).sort((a, b) => b.count - a.count)
  }

  @computed get getTagName() {
    return navigation.searchParams.get("tagName");
  }

  @computed get showMore() {
    return this.state.tagArr.length > 3;
  }

  protected updateUrl(tagName: string) {
    setQueryParams({ tagName }, { replace: true })
  }

  clickTag = (index: number) => {
    this.state.tagArr.forEach(item => {
      item.active = false
    })
    this.state.tagArr[index].active = !this.state.tagArr[index].active
    this.updateUrl(this.state.tagArr[index].name)
    this.setState({
      tagArr: this.state.tagArr
    })
  }
  
  clickMore = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({
      anchorEl: event.currentTarget,
      isOpen: true
    })
  }

  close = () => {
    this.setState({
      isOpen: false
    })
  }

  renderTag(type: string) {
    return (
      <>
        <div className="tagStyle">
          <div className="labels">
            {this.state.tagArr.map((item, index) => {
              if (type=== 'outer' && index > 2) {
                return null
              }
              if (type=== 'inner' && index < 3) {
                return null
              }
              return (
                <span
                  key={`span${index}`}
                  className={cssNames({inner: type === 'inner', active: item.active})}
                  onClick={() => this.clickTag(index)}
                >
                  {item.name}
                </span>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  renderContent() {
    return (
      <div className="PageFiltersTag">
        {this.renderTag('outer')}
        <Button style={{ padding: 0, minWidth: 30, display: this.showMore ? '' : 'none' }} onClick={this.clickMore}>
          <Icon material="more_horiz" title="more" />
        </Button>
        <Popover
          open={this.state.isOpen}
          anchorEl={this.state.anchorEl}
          onClose={this.close}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div className="popInner">
            {this.renderTag('inner')}
          </div>
        </Popover>
      </div>  
    )
  }

  render() {
    return (
      <>
        {this.renderContent()}
      </>
    )
  }
}
