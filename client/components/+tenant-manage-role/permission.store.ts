import {autobind} from "../../utils";
import {action, observable} from "mobx";
import {apiPermission} from "../../api";

@autobind()
export class TenantPermissionListStore {

  @observable items = observable.array<string>([], {deep: false});
  @observable isLoading = false;
  @observable isLoaded = false;

  @action
  async loadAll() {
    this.isLoading = true;
    let items: string[];
    try {
      items = await this.loadItems();
    } finally {

      if (items) {
        this.items.replace(items);
      }
      this.isLoading = false;
      this.isLoaded = true;
    }
  }

  protected async loadItems(): Promise<string[]> {
    return apiPermission.get("/permission_list").then((data: string[]) => data)
  }
}

export const tenantPermissionListStore = new TenantPermissionListStore();