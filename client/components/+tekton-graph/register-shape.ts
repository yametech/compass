import G6 from "@antv/g6";
import { Item } from "@antv/g6/lib/types";
import { Group, IShape } from "@antv/g-canvas/lib";
import {
  PipelineGraphConfig,
  pipelineNode,
  NodeRole,
  hasRightNeighborNode,
  hasSubNode,
} from "./common";
import {
  NodeStatus,
  NodeStatusColor,
  defaultTaskName,
} from "../+constant/tekton-constants";
import { INode } from "@antv/g6/lib/interface/item";

/**
 * 计算字符串的长度
 * @param {string} str 指定的字符串
 */
const calcStrLen = (str: string) => {
  var len = 0;
  for (var i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) {
      len++;
    } else {
      len += 2;
    }
  }
  return len;
};

/**
 * 计算显示的字符串
 * @param {string} str 要裁剪的字符串
 * @param {number} maxWidth 最大宽度
 * @param {number} fontSize 字体大小
 */
const fittingString = (str: string, maxWidth: number, fontSize: number) => {
  var fontWidth = fontSize * 1.3; //字号+边距
  maxWidth = maxWidth * 2; // 需要根据自己项目调整
  var width = calcStrLen(str) * fontWidth;
  var ellipsis = "…";
  if (width > maxWidth) {
    var actualLen = Math.floor((maxWidth - 10) / fontWidth);
    var result = str.substring(0, actualLen) + ellipsis;
    return result;
  }
  return str;
};

const circle = "circle";

function drawPipeline(cfg: PipelineGraphConfig, group: Group): IShape {
  const shape = drawBase(cfg, group);
  drawNodeStatus(cfg, group);
  drawTime(cfg, group);
  return shape;
}

//drawBase draw base shape :4shape
function drawBase(cfg: PipelineGraphConfig, group: Group): IShape {
  const shape = group.addShape("rect", {
    attrs: {
      x: 1,
      y: 1,
      width: 180,
      height: 45,
      radius: 5,
      fill: "#fff",
      stroke: '#dbdada',
      strokeOpacity: 0.2,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      shadowColor: '#dbdada',
      shadowBlur: 8,
    },
    name: "main-box",
    draggable: true,
  });

  // 标题
  group.addShape("text", {
    labels: defaultTaskName,
    attrs: {
      y: cfg.status ? 20 : 25,
      x: 10,
      height: 16,
      width: 16,
      text: fittingString(String(cfg.taskName), 50, 5),
      style: {
        fontWeight: 900,
      },
      fill: "gray",
    },
    name: "title",
  });

  group.addShape("image", {
    attrs: {
      x: 145,
      y: 10,
      width: 25,
      height: 25,
      img:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAlCAYAAAAuqZsAAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARMSURBVFhHvZjNbtRWFMct8QSFN6AvQHkB4AnaFyjddQtblhGrgJAqtUsqwaZQsQKEIBILEBCgixaQCERBSQhQSOZ7Mh+Zmcwc/DvJsa5v7jieqdMr/SWPfT5+Pufea3siCYzRaKQaDoeyvb0tg8FA+v2+9Ho92drakm6sTrcr3VidTiclPce12AZbfPAlBrGIafGzxh4wF8oFIhFJ/y235MZfFfnp9w9y6uKKfDfzTg79vKDimHNcwwZbfPB1AfPApcAMyKpkQFTi2VJdfvjtfQKRV/jgq9XcBfSrFxoJmAvFndEGWvLmY1MrEEo6iYhBLGISmxxZcAq2Byq+K+7wz+dlOXzmbTDRNCLW3KuaxiZHFlw0DurSvfVg8CJE7P3gFGwP1NxGMGCRIocPB4vBRZAyGXVOxYa0LxToIJS0Nc7trlYFs9XHpFz40Ch0Tu0ncpGT3LZaDS6ijCzjdrstp6dYfd+eW5KZWyUVxyGbLJGT3DC4LY20WnE55xerQcdxAuLKk5qWvd4ZqhicmxSQ3DC4VYsgbbVa8v2vq0EnXyS99aKpEFuDkczeK8mRs4uqmdsbUwGSGwar2g5Y3N+PG82gg69f7lc0KckfLLak0R1Krb2tbQQMGx8QHz9OSJubm/r4omq0M6K/13OsxLnXrbj3EgO15ehuJVwIHxAbbPHB140VEgyw2AqNKOGPl9eCxq6eLHVkrdLXKmRVaaeabbVhvFvvqa8fzxcMbjsjSnjywkrQ2NXDOBli3lyd35n0LiCavVuWbn+nhbdfNtUWYPxCMV3BAAtbh4I1m83Uq8s4GZj9dgHbvZGKwTl30ucFgwEWm2cKFjL05YOZgPjSGKhcIFNeMASLbRtR4z+CIeYUCl2bBAyWFNixKVrpqggwGFJglG+SyR+6VgQYDKlW8iPPdnHzn6a8WOsmW4SrcWDYch5f/5ovGGBJJj9L9NqzUtDY1fHzy8GNFPlgXMMGW3zwtWvjBENqu2BTe/+5FjT25W4RLqCBuUAMf+vIUq1eT2+wPAaYdHkf4sgHXC33VdMAIXLDkHok0VNK+PhtvoetKxeQMSmQidwwpB7i9tpTbzRyLYKiRU5yu23U1x4IWaKsiFerVfnmf3y1Jhc53W0ieVGEEFKba9eeHvwXkunO36Vkblm1kldrCLVqu3ONsl68+yUYqEiRg1y2RbjVUjAOOGGfbxiydA8SjtjkUKg4Z/DzjQPKRxntg5ee40hbi5xzxKJ9xLZ5NfaDlwNIfThr68vlciGrlRjEStrnQbnVYmT+qUIAJme1VpNHC6WJNmETPvgSg1h5oBj7/g3FiqHs3CnBVz5V5I/5da3Aidnl1CsTx5zjGjaVSkV98CUGsYhJ7CwoRu4/7tgArYLMERJWq1UVAAqx+5tr2FiF8CUGsWz1ZUExUmAMDA2QANyZAfLI4K4NkiogAJD9Nhjdn2IfAyKWu/rGQYmIfAXuNFIXGDKDxgAAAABJRU5ErkJggg==",
    },
    name: "image-shape",
  });

  if (!cfg.status) {
    group.addShape('circle', {
      attrs: {
        x: 180,
        y: 22.5,
        r: 6,
        fill: '#fff',
        stroke: '#dbdada',
        strokeOpacity: 0.6,
      },
      name: 'right-circle-path1',
    });
    group.addShape('rect', {
      attrs: {
        x: 173,
        y: 16,
        width: 8,
        height: 13,
        fill: '#fff'
      },
      name: 'right-circle-path2',
    });
    group.addShape('circle', {
      attrs: {
        x: 180,
        y: 22.5,
        r: 3,
        fill: '#959DA5'
      },
      name: 'right-circle-path3',
    });
  
    group.addShape('circle', {
      attrs: {
        x: 0,
        y: 22.5,
        r: 6,
        fill: '#fff',
        stroke: '#dbdada',
        strokeOpacity: 0.6,
      },
      name: 'left-circle-path1',
    });
    group.addShape('rect', {
      attrs: {
        x: 1,
        y: 16,
        width: 6,
        height: 13,
        fill: '#fff'
      },
      name: 'left-circle-path2',
    });
    group.addShape('circle', {
      attrs: {
        x: 0,
        y: 22.5,
        r: 3,
        fill: '#959DA5',
      },
      name: 'left-circle-path3',
    });
  }
  return shape;
}

function drawStatus(group: Group, color: string, name: string): IShape {
  return group.addShape(circle, {
    attrs: {
      x: 20,
      y: 35,
      r: 3.5,
      fill: color,
    },
    name: name + circle,
  });
}

const drawTextShape = (group: Group, name: string, text: string) => {
  return group.addShape("text", {
    attrs: {
      y: 40,
      x: 25,
      height: 16,
      width: 16,
      text: text,
      fill: "gray",
      fontSize: 10,
    },
    name: name,
  });
};

function drawNodeStatus(cfg: PipelineGraphConfig, group: Group): IShape {
  switch (cfg.status) {
    case NodeStatus.Pending:
      drawStatus(group, NodeStatusColor.Pending, NodeStatus.Pending);
      return drawTextShape(group, NodeStatus.Pending, "Pending.");

    case NodeStatus.Running:
      drawStatus(group, NodeStatusColor.Running, NodeStatus.Running);
      //status for text
      return drawTextShape(group, NodeStatus.Running, "Running.");

    case NodeStatus.Progress:
      drawStatus(group, NodeStatusColor.Progress, NodeStatus.Running);
      return drawTextShape(group, NodeStatus.Progress, "In progress.");

    case NodeStatus.Cancel:
      drawStatus(group, NodeStatusColor.Cancel, "cancel");
      //status for text
      return drawTextShape(group, NodeStatus.Cancel, "Cancel.");

    case NodeStatus.Succeeded:
      // set status
      drawStatus(group, NodeStatusColor.Succeeded, NodeStatus.Succeeded);
      //status for text
      return drawTextShape(group, NodeStatus.Succeeded, "Succeed.");

    case NodeStatus.Timeout:
      // set status
      drawStatus(group, NodeStatusColor.Timeout, "timeout");
      //status for text
      return drawTextShape(group, NodeStatus.Timeout, "Timeout.");

    case NodeStatus.Failed:
      // set status
      drawStatus(group, NodeStatusColor.Failed, "failed");
      //status for text
      return drawTextShape(group, NodeStatus.Failed, "Failed.");
  }
}

function drawTime(cfg: PipelineGraphConfig, group: Group) {
  if (cfg.showtime) {
    //time for image
    group.addShape("image", {
      labels: "timeimage",
      attrs: {
        x: 90,
        y: 27,
        width: 15,
        height: 15,
        img:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAaCAYAAACtv5zzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAF4SURBVEhL7ZQ9S8MxEIf9mI7iVtGlCh18AYWiQ1F0sIIuHVxU0KEIDoLg4CCCi4ib4iCoa11PnjQHeWsSwW594Gi43OWX/901UzJmJgJFigI3t3cyPdPwDF8tRYHXt3c5Pe/L/OKyMdb4aqkq0efXt7TW2sZY/4VIYP+wJ2cXfRkMfszv7FwzKtHC0orZA76os3dg1ikigfXNbXOIHqxluX94NKblcmNaq22bHRMJUAKT3GjK5dW19cawRwyxubIlS0RSblLYo4Q6Yb3jE7sT4wno7Tu7Xevx4dDu0fAClAuIzX2FJ6A3Cm9PMo2kuezzlYrmqGCIJ0ADCQ7nnBLgx8KGEouf3BRJgafnF+sZon7MvT0QWy2gwanp0TGlDy7Epi6leAJAMLUOD0pBDLGMa5qPWECbxrSUqBnpSAA0cWNrJ/mw4eNdIibsSUhSAGia/lMpA2Pqjip7oxrrMlIAmH9GlPeJAzHW+HLPg0tW4D+YCBQZs4DIL0rDBl0skTbvAAAAAElFTkSuQmCC",
      },
      name: "image-shape",
    });
    //time for text
    return group.addShape("text", {
      labels: "time",
      attrs: {
        y: 40,
        x: 103,
        text: cfg.time ?? "0s",
        fill: "gray",
        fontSize: 10,
      },
      name: "title",
    });
  }
}

function drawAddNode(group: Group) {
  const color = "#2196f3";
  group.addShape("circle", {
    name: "test",
    labels: "addond",
    attrs: {
      x: 186.5,
      y: 23,
      r: 9,
      stroke: color,
      fill: color,
      isCollapseShape: true,
    },
  });

  group.addShape("text", {
    name: "right-plus",
    labels: "addond",
    attrs: {
      x: 187,
      y: 23.5,
      width: 18,
      height: 18,
      lineHeight: 18,
      textAlign: "center",
      textBaseline: "middle",
      text: "+", //✚
      fontSize: 16,
      fontWeight: 600,
      fill: "#fff",
      cursor: "pointer",
      isCollapseShape: true,
    },
  });
}

function drawSubNode(group: Group) {
  group.addShape("image", {
    labels: "addond",
    attrs: {
      x: -15,
      y: 14,
      width: 18,
      height: 18,
      img: 'data:img/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAACpklEQVRYR82YTWgTQRTH/283TdZD6cVcBS2Cgu1B8KIxbqVu0FZvAcW7VrD4dejBs4ce6gcV/DgrCrlpqzSKxli9FD2oYEBF8BovpYds0uw+ma0JSbq7s2kbmLnOe29+8z5m3gyhy8FWemeVtAwzUgTay8Q7iNEvzDBhhZj+MPg7ERYT7C5Qvvi7myUoijBns3ptuZx1gYsADgKIpCcYAXzUgLvxgWSOcjlHtp7UsJ0xR5kxC2CPzJhkvkSESWOh8DpMLhCITdOoxnEbwDmO7pFQJlrz2MNEDZepULD9hH2BVo4fTsZcfR6MA5v0ir86YamuOWP9L9+XOwXWAQmYPkcv8uZDJPNWaVV30p1QbUAiTHYCxZ55Zr07lowq0q3hawOyLfM+A+d7EqYAowQ8MPKFicZ0E0hUExj5rUrgqJvyEp1gNarPAxLnjL1c/rYFpR2Vo1OuZAwk94lzygOqWuZpF3gSnoUEbewktMHdcN68An/9Ei4+NAz96DG4v37AnX8OsKj44KEBZxL5wlMPqGKZiwAOhSqMn0J88oonwo6D1ekbcN+99VXRjoygb+o6SNe9+drsLbhzz2Te+7AtX0iRPZraxVrsp+w6iF26htiJ8abRIKhOGKFQfzGH+p0ZGRAbcAfJzpgTzLgnk6ahYcSnbzZ37ecpPxgBXpu6Kg2xsEeEC1SxzEcAzsqAxHzQgiJ8YrSGKUpofdZ8TLY18onB+6MAhUF5O/yfMxuEAYE+UyVjlsHYHhUoCKpVX5b0gWsR/pJtmTYDiW6AwqA2DLNWVVX1gBQMmWpJrVzZq3YwKnd1KHe5CiDl2g/lGjThJaVa2Ma1oVST793Qqj2DBJRSD8VG6JR6SjeglPpsaO2NlPmOaesAVfqw6uwkxd0HPWb16kvvHz8/8OLQfgf0AAAAAElFTkSuQmCC',
      cursor: "pointer",
      isCollapseShape: true,
    },
    name: "left-plus",
  });
}
const setState = (group: Group, fill: string, text: string) => {
  const shapestatus = group.get("children")[3];
  const shapeText = group.get("children")[4];
  shapestatus.attr({
    fill: fill,
  });

  if (text !== NodeStatus.Succeeded) {
    shapestatus.animate(
      {
        // Magnifying and disappearing
        r: 3,
        opacity: 0.6,
      },
      {
        duration: 2000,
        easing: "easeCubic",
        delay: 2000,
        repeat: true, // repeat
      }
    ); // 2s delay
  }

  shapeText.attr({
    text: text,
    fontStyle: "",
  });
};

G6.registerNode(pipelineNode, {
  drawShape: function drawShape(cfg: PipelineGraphConfig, group: Group) {
    return drawPipeline(cfg, group);
  },

  // handle node event
  setState(name: string, value: string, item: Item) {
    const group = item.getContainer();
    if (name === "time" && value) {
      group
        .getChildren()
        .find((child) => {
          return child.get("labels") === "time";
        })
        .attr({ text: value });
    }

    if (
      name === "hover" &&
      value &&
      item.getModel().role === NodeRole.Primary
    ) {
      setTimeout(() => {
        drawAddNode(group);

        if (item.getID() === "1-1") {
          return;
        }

        if (hasRightNeighborNode(item as INode)) {
          return;
        }

        if (hasSubNode(item as INode)) {
          return;
        }

        drawSubNode(group);
      }, 100);
    }

    if (name === "hover" && value && item.getModel().role === NodeRole.Second) {
      setTimeout(() => {
        drawSubNode(group);
      }, 100);
    }

    if (name === "hover" && !value) {
      setTimeout(() => {
        group
          .getChildren()
          ?.filter((child) => {
            return child.get("labels") === "addond";
          })
          .map((item) => {
            group.removeChild(item);
          });
      }, 300);
    }

    if (name === "click") {
      let shape = group.get("children")[2];
      shape.attr({ text: value });
      return;
    }

    if (name === NodeStatus.Running) {
      setState(group, NodeStatusColor.Running, `${NodeStatus.Running}. `);
      return;
    }

    if (name === NodeStatus.Pending) {
      setState(group, NodeStatusColor.Pending, `${NodeStatus.Pending}. `);
      return;
    }

    if (name === NodeStatus.Succeeded) {
      setState(group, NodeStatusColor.Succeeded, `${NodeStatus.Succeeded}. `);
      return;
    }

    if (name === NodeStatus.Failed) {
      setState(group, NodeStatusColor.Failed, `${NodeStatus.Failed}. `);
      return;
    }

    if (name === NodeStatus.Cancel) {
      setState(group, NodeStatusColor.Cancel, `${NodeStatus.Cancel}. `);
      return;
    }

    if (name === NodeStatus.Timeout) {
      setState(group, NodeStatusColor.Timeout, `${NodeStatus.Timeout}. `);
      return;
    }
  },
});
