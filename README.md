# compass |[中文](README_zh.md)
![compass](https://github.com/yametech/compass/workflows/compass/badge.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](http://github.com/yametech/compass/blob/master/LICENSE)

##  Why Compass

  The compass is to specify the direction for kubeneters so that they don’t lose their way in the ocean of containers.

![image](https://user-images.githubusercontent.com/22409551/90589013-9fb44600-e20f-11ea-936c-33a28c58c4ca.png)


![image](https://user-images.githubusercontent.com/22409551/90589174-18b39d80-e210-11ea-8e60-870772c70c2e.png)

![image](https://user-images.githubusercontent.com/22409551/91035244-e2738500-e638-11ea-9da3-e5f5380555ce.png)

![image](https://user-images.githubusercontent.com/22409551/91150717-57a19180-e6ef-11ea-9c80-ee802ed7e4ef.png)


![image](https://user-images.githubusercontent.com/22409551/91035880-12228d00-e639-11ea-9214-4dac2b51ce9e.png)


![image](https://user-images.githubusercontent.com/22409551/90589114-e73ad200-e20f-11ea-9406-0a61f98b5b7d.png)

## Feature


- Support multi-tenant management and authority management
- Support CICD  base [tektoncd](https://github.com/tektoncd/pipeline)
- Support multi zone deployment, in-place upgrade application, blue-green release, canary release, group release, etc.
- Support webshell to enter the container and also has Debug Pod.
- Supports monitoring of various indicators of clusters, nodes, and applications
- Support the division of networks, qos, and subnets for tenants.
- Support ovn management


## Install 

```shell
# label master node
for node in $(kubectl get node -l node-role.kubernetes.io/master |awk '{print $1}'); do kubectl label nodes $node yamecloud.kubernetes.io/node=master --overwrite; done

kubectl apply -f https://raw.githubusercontent.com/yametech/compass/master/kubernetes/release-0.2.0.yaml

//find compass svc
kubectl  get svc  -n kube-system

//user/password
admin/admin
```


## Dev

#### Require 

Nodejs >= 14.x


``` js

yarn install && yarn dev


```

## Build  Image

``` shell

make

```


## Thanks

[lens](https://github.com/lensapp/lens)
