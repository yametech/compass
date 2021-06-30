import {Secrets} from "../+config-secrets";
import { observable } from "mobx";

export class TektonConfg extends Secrets  {
  @observable className = "TektonConfig"
}

