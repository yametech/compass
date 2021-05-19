import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import './grant-role-dialog.scss';
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { observable } from "mobx";
import { TenantRole, tenantRoleApi } from "../../api/endpoints";
import { Wizard, WizardStep } from "../wizard";
import { Trans } from "@lingui/macro";
import { Notifications } from "../notifications";
import { apiPermission } from "../../api";


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 'auto',
    },
    paper: {
      width: 270,
      height: 400,
      padding: 10,
      overflow: 'auto',
    },
    button: {
      margin: theme.spacing(0.5, 0),
      minWidth: 50
    },
    roots: {
      height: 110,
      flexGrow: 1,
      maxWidth: 400,
    },
    group: {
      marginLeft: '17px !important'
    },
    label: {
      fontSize: '13px',
      lineHeight: '25px'
    },
    icon: {
      fontSize: '16px'
    }
  }),
);

interface RenderTree {
  id?: string;
  name?: string;
  children?: RenderTree[];
}

interface resTree {
  id?: string,
  name?: string,
  children?: resTree[]
}

interface Iprops {
  checkedMap: Object,
  resTree: resTree
}

export const TransferList = forwardRef((props: Iprops, ref: any) => {

  let allTree: RenderTree = null;
  const loopNode = (ARR: RenderTree[], id: string) => {
    ARR && ARR.forEach(item => {
      let newId = `${id}/${item.name}`;
      item.id = newId;
      if (Array.isArray(item.children)) {
        loopNode(item.children, newId);
      }
    })
  }

  let resTree = props.resTree;

  if (props.resTree) {
    resTree.id = resTree.name;
    loopNode(resTree.children, resTree.id);
    allTree = resTree;
  } else {
    return null;
  }

  const classes = useStyles();
  const [allNode, setAllNode] = React.useState<string[]>([]);
  const [left, setLeft] = React.useState<string[]>([]);
  const [right, setRight] = React.useState<string[]>([]);
  const [leftSelected, setLeftSelected] = React.useState<string[]>([]);
  const [rightSelected, setRightSelected] = React.useState<string[]>([]);

  useEffect(() => {
    let all: string[] = []
    const loopTree = (item: any) => {
      all.push(item.id)
      if (item.children) {
        item.children.map((node: any) => loopTree(node))
      }
    }
    loopTree(allTree);

    const matchNode = (map: object) => {
      let transNode: string[] = []
      for (let [k, v] of Object.entries(map)) {
        transNode = transNode.concat(v.map((item: string) => `${k}/${item}`))
      }
      return all.filter(item => {
        return transNode.some(n => {
          let one = item.split('/')
          let one2 = ''
          if (one.length > 2) {
            one2 = `${one[one.length - 2]}/${one[one.length - 1]}`
          }
          return item.indexOf(n) !== -1 && n === one2
        })
      })
    }

    let matched = matchNode(props.checkedMap)
    setLeft(all.filter((value) => matched.indexOf(value) === -1));
    setRight(loopParentNode(matched));
    setAllNode(all);
  }, [props.checkedMap])

  const handleLeft = (nevent: React.ChangeEvent<{}>, nodeIds: string[]) => {
    setLeftSelected(nodeIds);
  };

  const handleRight = (nevent: React.ChangeEvent<{}>, nodeIds: string[]) => {
    setRightSelected(nodeIds);
  };

  const loopParentNode = (nodes: string[]) => {
    return nodes.reduce((pre, next) => {
      let NODE = next.split('/').reduce((p, n) => {
        p.push(`${p.length > 0 ? `${p[p.length - 1]}/` : ''}${n}`);
        return p
      }, [])
      return Array.from(new Set(pre.concat(NODE)));
    }, [])
  }

  const loopChildNode = (nodes: string[]) => {
    let NODE: string[] = [];
    nodes.forEach(one => {
      NODE = NODE.concat(allNode.reduce((pre, next) => {
        if (next.startsWith(one)) pre.push(next);
        return pre;
      }, []))
    })
    return Array.from(new Set(NODE));
  }

  const totalNode = (a: string[]) => {
    return Array.from(new Set(loopParentNode(a).concat(loopChildNode(a))));
  }

  const handleCheckedRight = () => { // 向右移动
    let moveNode = totalNode(leftSelected);
    setRight(right.concat(moveNode));
    setLeft(left.filter((value) => loopChildNode(leftSelected).indexOf(value) === -1));
    setLeftSelected([]);
  }

  const handleCheckedLeft = () => { // 向左移动
    let moveNode = totalNode(rightSelected);
    setLeft(left.concat(moveNode));
    setRight(right.filter((value) => loopChildNode(rightSelected).indexOf(value) === -1));
    setRightSelected([]);
  }

  useImperativeHandle(ref, () => { // 把参数暴露给父组件
    let expandArr: any[] = [];
    const loopExpand = (item: any) => {
      expandArr.push({
        id: item.id,
        children: !!item.children
      })
      if (item.children) {
        item.children.map((node: any) => loopExpand(node));
      }
    }
    loopExpand(allTree);

    let validArr = right.filter(item => expandArr.some(a => a.id === item && !a.children));
    let checkedNode = {} as any;
    validArr.forEach(item => {
      let one = item.split('/');
      let key = one[one.length - 2];
      let value = one[one.length - 1];
      if (checkedNode.hasOwnProperty(key)) {
        checkedNode[key] = checkedNode[key].concat(value);
      } else {
        Object.assign(checkedNode, { [key]: [value] });
      }
    });
    return checkedNode;
  })

  const renderTree = (nodes: RenderTree, type: string) => { // 渲染树节点
    const ARR = type === 'left' ? left : right;
    const notLeaf = ARR.filter(item => item.startsWith(nodes.id) && !!nodes.children)
    if (notLeaf.length === 1) {
      return null
    }
    if (ARR.indexOf(nodes.id) === -1) {
      return null
    }
    return (
      <TreeItem
        key={nodes.id}
        nodeId={nodes.id}
        classes={{ group: classes.group, label: classes.label }}
        label={nodes.name}
      >
        {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node, type)) : null}
      </TreeItem>
    )
  };

  const customLeft = (items: RenderTree) => (
    <Paper className={classes.paper}>
      <TreeView
        multiSelect
        className={classes.roots}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['compass']}
        defaultExpandIcon={<ChevronRightIcon />}
        selected={leftSelected}
        onNodeSelect={handleLeft}
      >
        {renderTree(items, 'left')}
      </TreeView>
    </Paper>
  );

  const customRight = (items: RenderTree) => (
    <Paper className={classes.paper}>
      <TreeView
        multiSelect
        className={classes.roots}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['compass']}
        defaultExpandIcon={<ChevronRightIcon />}
        selected={rightSelected}
        onNodeSelect={handleRight}
      >
        {renderTree(items, 'right')}
      </TreeView>
    </Paper>
  );

  return (
    <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
      <Grid item>{customLeft(allTree)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            variant="contained"
            color="secondary"
            size="small"
            disabled={!leftSelected.length}
            className={classes.button}
            onClick={handleCheckedRight}
            aria-label="move selected right"
          >
            <ChevronRightIcon className={classes.icon} />
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            disabled={!rightSelected.length}
            className={classes.button}
            onClick={handleCheckedLeft}
            aria-label="move selected left"
          >
            <ChevronLeftIcon className={classes.icon} />
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customRight(allTree)}</Grid>
    </Grid>
  );
})

// grant component
interface Props extends Partial<DialogProps> {
}

@observer
export class GrantRoleDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static data: TenantRole = null;
  @observable name = "";
  @observable namespace = "";
  @observable transferRef = React.createRef();
  @observable permissionTree: resTree;
  @observable checkedMap = {};

  static open(object: TenantRole) {
    GrantRoleDialog.isOpen = true;
    GrantRoleDialog.data = object;
  }

  static close() {
    GrantRoleDialog.isOpen = false;
  }

  close = () => {
    GrantRoleDialog.close();
  }

  reset = () => {
    this.name = "";
  }

  get tenantRole() {
    return GrantRoleDialog.data
  }

  onOpen = () => {
    if (this.tenantRole.spec.privilege != undefined) {
      this.checkedMap = this.tenantRole.spec.privilege
    }
    this.name = this.tenantRole.getName();
    apiPermission.get("/permission_tree").then((data: resTree) => {
      this.permissionTree = data
    })
  }

  updateRole = async () => {
    const { name, namespace } = this;
    const role: Partial<TenantRole> = {
      spec: {
        tenant_id: this.tenantRole.spec.tenant_id,
        department_id: this.tenantRole.spec.department_id,
        namespaces: this.tenantRole.spec.namespaces,
        privilege: this.transferRef.current as object,
        comment: this.tenantRole.spec.comment,
      }
    }
    this.tenantRole.spec = role.spec
    try {
      const newRole = await tenantRoleApi.update({ namespace, name }, this.tenantRole);
      this.reset();
      Notifications.ok(
        <>Role {name} grant succeeded</>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const { ...dialogProps } = this.props;

    const header = <h5><Trans>Grant Role</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        className="GrantRoleDialog"
        isOpen={GrantRoleDialog.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Update</Trans>} next={this.updateRole}>
            <div className="namespace">
              <TransferList resTree={this.permissionTree} checkedMap={this.checkedMap} ref={this.transferRef} />
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}