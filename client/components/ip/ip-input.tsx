import React from "react";
import {Input} from "../input";
import {Grid} from "@material-ui/core";
import {observer} from "mobx-react";
import {computed, observable} from "mobx";
import {Validator} from "../input/input.validators";

const ipaddr = require('ipaddr.js');

interface IPInputProps<T = any> {
  value?: T;
  onChange?(value: T): void;
  isIPv4CIDR?: boolean;
}

@observer
export class IPInput extends React.Component<IPInputProps> {

  @observable IP: number [] = [0, 0, 0, 0];
  @observable IPRefs: any[] = [null, null, null, null];
  @observable Mask: number = 0;
  @observable.ref MaskRef: any = null;
  @observable isIPv4CIDR: boolean = false;
  @observable valid: boolean = false;

  @computed get value(): string {
    try {
      // check cidr
      const cidr = ipaddr.parseCIDR(this.props.value);
      if (this.props.isIPv4CIDR && !ipaddr.IPv4.isIPv4(this.props.value) && cidr.length == 2) {
        this.IP = cidr[0];
        this.Mask = cidr[1];
      }
      return this.props.value;
    } catch (err) {
      // check ip
      let addr = new ipaddr.IPv4(this.IP);
      if (this.props.isIPv4CIDR) {
        return addr.toString() + '/' + this.Mask;
      }
      return addr.toString();
    }
  }

  componentDidMount() {
    try{
      this.IP = ipaddr.IPv4.parse(this.props.value).octets;
    }
    catch {
      try {
        const cidr = ipaddr.parseCIDR(this.props.value);
        if (this.props.isIPv4CIDR && !ipaddr.IPv4.isIPv4(this.props.value) && cidr.length == 2) {
          this.IP = cidr[0].octets;
          this.Mask = cidr[1];
        }
      }catch {
        this.IP = [0, 0, 0, 0];
      }
    }

    this.validator();
    for (let item of this.IPRefs.values()) {
      item.setDirty(!this.valid);
    }
    if (this.MaskRef) {
      this.MaskRef.setDirty(!this.valid)
    }
  }

  isValidClass: Validator = {
    condition: ({required}) => required,
    message: () => ``,
    validate: () => {
      return this.valid;
    }
  };

  validator() {
    try {
      let addr = new ipaddr.IPv4(this.IP);
      this.valid = addr.kind() === 'ipv4' &&
        ipaddr.IPv4.parse(addr.toString()).range() === 'private';
    } catch (e) {
      this.valid = false;
    }
  }

  private onIPDirty() {
    for (let item of this.IPRefs.values()) {
      item.setDirty(!this.valid);
      if (!item.focused && !this.valid) {
        item.setState({errors: [""], valid: this.valid});
      }
      if (!item.focused && this.valid) {
        item.setState({errors: [], valid: this.valid});
      }
    }
  }

  private onMaskDirty() {
    if (this.MaskRef) {
      this.MaskRef.setDirty(!this.valid);
      if (!this.MaskRef.focused && !this.valid) {
        this.MaskRef.setState({errors: [""], valid: this.valid});
      }
      if (!this.MaskRef.focused && this.valid) {
        this.MaskRef.setState({errors: [], valid: this.valid});
      }
    }
  }

  private dirty() {
    this.validator();
    this.onIPDirty();
    this.onMaskDirty();
  }

  private handleIPKeyDown(e: React.KeyboardEvent<any>, index: number) {
    if (e.keyCode === 190 && index < 3) {
      this.IP[index] = this.IP[index] + 1;
      setTimeout(() => {
        this.IP[index] = this.IP[index] - 1;
        // this.forceUpdate();
        this.IPRefs[index + 1].focus();
      });
    }
  }

  private handleIPChange(value: string, index: number) {
    this.IP[index] = Number(value) <= 255 ? Number(value) : 255;
    this.dirty();

    if (this.IP[index].toString().length >= 3 && index < 3) {
      this.IPRefs[index + 1].focus();
    }
    this.props.onChange(this.value);
  }

  private handleMaskChange(value: string) {
    this.Mask = Number(value) <= 32 ? Number(value) : 32;
    this.dirty();

    this.props.onChange(this.value);
  }

  renderSvg() {
    return (
      <Grid item>
        <svg className="icon" viewBox="0 0 1024 1024" version="1.1"
             xmlns="http://www.w3.org/2000/svg" width="20" height="32">
          <path d="M329.3 966.8h-61.4l405.8-922h58.2l-402.6 922z" fill="#8a8a8a"/>
        </svg>
      </Grid>
    )
  }

  render() {
    return (
      <>
        <Grid container spacing={1} direction={"row"}>
          <Grid item xs={4} sm={2}>
            <Input
              required
              autoFocus
              type={`number`}
              min={0}
              validators={this.isValidClass}
              ref={(ref) => this.IPRefs[0] = ref}
              value={this.IP[0]?.toString()}
              onKeyDown={(e) => this.handleIPKeyDown(e, 0)}
              onChange={(value) => {
                this.handleIPChange(value, 0)
              }}/>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Input
              required
              autoFocus
              type={`number`}
              min={0}
              validators={this.isValidClass}
              ref={(ref) => this.IPRefs[1] = ref}
              value={this.IP[1]?.toString()}
              onKeyDown={(e) => this.handleIPKeyDown(e, 1)}
              onChange={(value) => {
                this.handleIPChange(value, 1)
              }}/>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Input
              required
              autoFocus
              type={`number`}
              min={0}
              validators={this.isValidClass}
              ref={(ref) => this.IPRefs[2] = ref}
              value={this.IP[2]?.toString()}
              onKeyDown={(e) => this.handleIPKeyDown(e, 2)}
              onChange={(value) => {
                this.handleIPChange(value, 2)
              }}/>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Input
              required
              autoFocus
              type={`number`}
              min={0}
              validators={this.isValidClass}
              ref={(ref) => this.IPRefs[3] = ref}
              value={this.IP[3]?.toString()}
              onKeyDown={(e) => this.handleIPKeyDown(e, 3)}
              onChange={(value) => {
                this.handleIPChange(value, 3)
              }}/>
          </Grid>
          {this.props.isIPv4CIDR ?
            <>
              {this.renderSvg()}
              <Grid item xs={4} sm={2}>
                <Input
                  required
                  autoFocus
                  type={`number`}
                  min={0}
                  validators={this.isValidClass}
                  ref={(ref) => this.MaskRef = ref}
                  value={this.Mask?.toString()}
                  onChange={(value) => {
                    this.handleMaskChange(value)
                  }}/>
              </Grid>
            </> : null
          }
        </Grid>
      </>
    )
  }
}