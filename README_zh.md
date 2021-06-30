# compass  |[English](README.md)
![compass](https://github.com/yametech/compass/workflows/compass/badge.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](http://github.com/yametech/compass/blob/master/LICENSE)

##  `compass`简介

 指南针是为了给kubeneters指明方向，在容器的海洋中，不迷失方向。

![image](https://user-images.githubusercontent.com/22409551/90589013-9fb44600-e20f-11ea-936c-33a28c58c4ca.png)


![image](https://user-images.githubusercontent.com/22409551/90589174-18b39d80-e210-11ea-8e60-870772c70c2e.png)

![image](https://user-images.githubusercontent.com/22409551/91035244-e2738500-e638-11ea-9da3-e5f5380555ce.png)

![image](https://user-images.githubusercontent.com/22409551/91150717-57a19180-e6ef-11ea-9c80-ee802ed7e4ef.png)


![image](https://user-images.githubusercontent.com/22409551/91035880-12228d00-e639-11ea-9214-4dac2b51ce9e.png)


![image](https://user-images.githubusercontent.com/22409551/90589114-e73ad200-e20f-11ea-9406-0a61f98b5b7d.png)


## 特点

- 支持多租户管理与权限管理
- 支持基于tekton的cicd
- 支持多机房的发布，原地升级应用，蓝绿发布，金丝雀发布，分组发布等
- 支持webshell进入容器并且还具有Debug功能
- 支持集群，节点，应用的各类指标的监控
- 支持针对租户划分网络，qos，子网的划分。
- 支持ovn管理


## 安装

```shell

# 给master节点打标签
for node in $(kubectl get node -l node-role.kubernetes.io/master |awk '{print $1}'); do kubectl label nodes $node yamecloud.kubernetes.io/node=master --overwrite; done

kubectl apply -f https://raw.githubusercontent.com/yametech/compass/master/kubernetes/release-0.2.0.yaml

//找compass的svc。以nodeport的方式暴露
kubectl  get svc  -n kube-system

//账户密码
admin/admin
```


## 开发

`Nodejs版本要求14.x`

``` js

yarn install && yarn dev


```

## 镜像打包

``` shell

make

```


## 感谢

[lens](https://github.com/lensapp/lens)
