export interface Limitation {
  cpu: string;
  memory: string;
}

export interface Resource {
  limits: Limitation;
  requests: Limitation;
}

export interface Base {
  name: string;
  imageFrom?: string;
  image: string;
  imagePullPolicy: string;
  resource: Resource;
  imagePullSecret?: string;
}

export interface Environment {
  type: string;
  envConfig: any;
}

export interface Pattern {
  type: string;
  httpPort: string;
  url: string;
  tcpPort: string;
  command: string;
}

export interface Probe {
  status: boolean;
  timeout: string;
  cycle: string;
  retryCount: string;
  delay: string;
  pattern?: Pattern;
}

export interface LifeCycle {
  status: boolean;
  postStart: Pattern;
  preStop: Pattern;
}

export interface VolumeMount {
  name: string;
  mountPath: string;
  mountType: string;
}

export interface VolumeMounts {
  status: boolean;
  items: VolumeMount[];
}

export interface Container {
  base: Base;
  commands: string[];
  args: string[];
  environment: Environment[];
  readyProbe: Probe;
  liveProbe: Probe;
  lifeCycle: LifeCycle;
  volumeMounts: VolumeMounts;
}

export const base: Base = {
  name: "",
  image: "",
  imagePullPolicy: "IfNotPresent",
  resource: {
    limits: {
      cpu: "0.3",
      memory: "170",
    },
    requests: {
      cpu: "0.1",
      memory: "30",
    },
  },
};
export const commands: string[] = [];

export const args: string[] = [];

export const envVars: EnvVar[] = [];

export const environment: Environment[] = [];

export const volumeMountItems: VolumeMount[] = [];

export const readyProbe: Probe = {
  status: false,
  timeout: "",
  cycle: "",
  retryCount: "",
  delay: "",
  pattern: {
    type: "",
    httpPort: "",
    url: "",
    tcpPort: "",
    command: "",
  },
};
export const liveProbe: Probe = {
  status: false,
  timeout: "",
  cycle: "",
  retryCount: "",
  delay: "",
  pattern: {
    type: "",
    httpPort: "",
    url: "",
    tcpPort: "",
    command: "",
  },
};
export const lifeCycle: LifeCycle = {
  status: false,
  postStart: {
    type: "",
    httpPort: "",
    url: "",
    tcpPort: "",
    command: "",
  },
  preStop: {
    type: "",
    httpPort: "",
    url: "",
    tcpPort: "",
    command: "",
  },
};
export const volumeMount: VolumeMount = {
  name: "",
  mountPath: "",
  mountType: ""
};

export const volumeMounts: VolumeMounts = {
  status: false,
  items: volumeMountItems,
};

export const container: Container = {
  base: base,
  commands: commands,
  args: args,
  environment: environment,
  readyProbe: readyProbe,
  liveProbe: liveProbe,
  lifeCycle: lifeCycle,
  volumeMounts: volumeMounts,
};

export interface EnvVar {
  name: string;
  value?: string;
  //todo:so complex and optional,and then will support it.
  valaueFrom?: any;
}

export const envVar: EnvVar = {
  name: "",
  value: "",
};
