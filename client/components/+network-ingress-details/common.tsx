export interface Backend {
  serviceName: string
  servicePort: number
}

export interface Path {
  path?: string,
  backend: Backend
}

export interface Http {
  paths: Path[]
}

export interface Rule {
  host?: string;
  http: Http;
}

export interface Tls {
  hosts: string[];
  secretName: string;
}

export interface Annotation {
  name: string;
  type: string;
}

export const tls: Tls = {
  hosts: [""],
  secretName: "",
}

export const backend: Backend = {
  serviceName: "",
  servicePort: 0,
}

export const path: Path = {
  path: "",
  backend: backend
}

export const paths: Path[] = []

export const http: Http = {
  paths: []
}

export const rule: Rule = {
  host: "",
  http: http
}

export const annotation: Annotation = {
  name: "",
  type: ""
}