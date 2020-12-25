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
      x: 2,
      y: 2,
      width: 180,
      height: 42,
      radius: 8,
      fill: "#fff",
    },
    name: "main-box",
    draggable: true,
  });

  // 标题
  group.addShape("text", {
    labels: defaultTaskName,
    attrs: {
      y: 20,
      x: 5,
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
      x: 140,
      y: 10,
      width: 25,
      height: 25,
      img:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAlCAYAAAAuqZsAAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARMSURBVFhHvZjNbtRWFMct8QSFN6AvQHkB4AnaFyjddQtblhGrgJAqtUsqwaZQsQKEIBILEBCgixaQCERBSQhQSOZ7Mh+Zmcwc/DvJsa5v7jieqdMr/SWPfT5+Pufea3siCYzRaKQaDoeyvb0tg8FA+v2+9Ho92drakm6sTrcr3VidTiclPce12AZbfPAlBrGIafGzxh4wF8oFIhFJ/y235MZfFfnp9w9y6uKKfDfzTg79vKDimHNcwwZbfPB1AfPApcAMyKpkQFTi2VJdfvjtfQKRV/jgq9XcBfSrFxoJmAvFndEGWvLmY1MrEEo6iYhBLGISmxxZcAq2Byq+K+7wz+dlOXzmbTDRNCLW3KuaxiZHFlw0DurSvfVg8CJE7P3gFGwP1NxGMGCRIocPB4vBRZAyGXVOxYa0LxToIJS0Nc7trlYFs9XHpFz40Ch0Tu0ncpGT3LZaDS6ijCzjdrstp6dYfd+eW5KZWyUVxyGbLJGT3DC4LY20WnE55xerQcdxAuLKk5qWvd4ZqhicmxSQ3DC4VYsgbbVa8v2vq0EnXyS99aKpEFuDkczeK8mRs4uqmdsbUwGSGwar2g5Y3N+PG82gg69f7lc0KckfLLak0R1Krb2tbQQMGx8QHz9OSJubm/r4omq0M6K/13OsxLnXrbj3EgO15ehuJVwIHxAbbPHB140VEgyw2AqNKOGPl9eCxq6eLHVkrdLXKmRVaaeabbVhvFvvqa8fzxcMbjsjSnjywkrQ2NXDOBli3lyd35n0LiCavVuWbn+nhbdfNtUWYPxCMV3BAAtbh4I1m83Uq8s4GZj9dgHbvZGKwTl30ucFgwEWm2cKFjL05YOZgPjSGKhcIFNeMASLbRtR4z+CIeYUCl2bBAyWFNixKVrpqggwGFJglG+SyR+6VgQYDKlW8iPPdnHzn6a8WOsmW4SrcWDYch5f/5ovGGBJJj9L9NqzUtDY1fHzy8GNFPlgXMMGW3zwtWvjBENqu2BTe/+5FjT25W4RLqCBuUAMf+vIUq1eT2+wPAaYdHkf4sgHXC33VdMAIXLDkHok0VNK+PhtvoetKxeQMSmQidwwpB7i9tpTbzRyLYKiRU5yu23U1x4IWaKsiFerVfnmf3y1Jhc53W0ieVGEEFKba9eeHvwXkunO36Vkblm1kldrCLVqu3ONsl68+yUYqEiRg1y2RbjVUjAOOGGfbxiydA8SjtjkUKg4Z/DzjQPKRxntg5ee40hbi5xzxKJ9xLZ5NfaDlwNIfThr68vlciGrlRjEStrnQbnVYmT+qUIAJme1VpNHC6WJNmETPvgSg1h5oBj7/g3FiqHs3CnBVz5V5I/5da3Aidnl1CsTx5zjGjaVSkV98CUGsYhJ7CwoRu4/7tgArYLMERJWq1UVAAqx+5tr2FiF8CUGsWz1ZUExUmAMDA2QANyZAfLI4K4NkiogAJD9Nhjdn2IfAyKWu/rGQYmIfAXuNFIXGDKDxgAAAABJRU5ErkJggg==",
    },
    name: "image-shape",
  });

  return shape;
}

function drawStatus(group: Group, color: string, name: string): IShape {
  return group.addShape(circle, {
    attrs: {
      x: 20,
      y: 36,
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
        y: 30,
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
        y: 42,
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
  const color = "#bbfdec";
  group.addShape("circle", {
    name: "test",
    labels: "addond",
    attrs: {
      x: 192.5,
      y: 23,
      r: 10.3,
      stroke: color,
      fill: color,
      isCollapseShape: true,
    },
  });

  group.addShape("text", {
    name: "right-plus",
    labels: "addond",
    attrs: {
      x: 192.5,
      y: 23,
      width: 20,
      height: 20,
      textAlign: "center",
      textBaseline: "middle",
      text: "✚",
      fill: "#51863d",
      cursor: "pointer",
      isCollapseShape: true,
    },
  });
}

function drawSubNode(group: Group) {
  const color = "#f1978b";
  group.addShape("circle", {
    name: "left-circle",
    labels: "addond",
    attrs: {
      x: -9.1,
      y: 23,
      r: 10.3,
      stroke: color,
      fill: color,
      isCollapseShape: true,
    },
  });
  group.addShape("text", {
    name: "left-plus",
    labels: "addond",
    attrs: {
      x: -9.1,
      y: 23,
      width: 20,
      height: 20,
      textAlign: "center",
      textBaseline: "middle",
      text: "⎼",
      fill: "#51863d",
      cursor: "pointer",
      isCollapseShape: true,
    },
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
