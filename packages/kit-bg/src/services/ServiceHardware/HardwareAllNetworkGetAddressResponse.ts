import type { PromiseTarget } from '@onekeyhq/shared/src/utils/promiseUtils';
import { createPromiseTarget } from '@onekeyhq/shared/src/utils/promiseUtils';
import stringUtils from '@onekeyhq/shared/src/utils/stringUtils';

import type {
  IHwAllNetworkPrepareAccountsItem,
  IHwSdkNetwork,
} from '../../vaults/types';

export class HardwareAllNetworkGetAddressResponse {
  uuid = stringUtils.generateUUID();

  onSdkItemCallResponse(item: IHwAllNetworkPrepareAccountsItem) {
    const promiseTarget = this.getOrCreateItemPromiseTarget({
      path: item.path,
      hwSdkNetwork: item.network,
    });
    promiseTarget.resolveTarget(item);
  }

  destroy() {
    console.log('HardwareAllNetworkGetAddressResponse__destroy', {
      uuid: this.uuid,
    });
    this.promiseTargets = {};
    this.bundleLength = 0;
  }

  promiseTargets: Record<
    string,
    PromiseTarget<IHwAllNetworkPrepareAccountsItem>
  > = {};

  getOrCreateItemPromiseTarget({
    path,
    hwSdkNetwork,
  }: {
    path: string;
    hwSdkNetwork: IHwSdkNetwork;
  }) {
    const key = this.buildItemPromiseTargetKey({ path, hwSdkNetwork });
    console.log(
      'HardwareAllNetworkGetAddressResponse__getOrCreateItemPromiseTarget',
      {
        key,
        uuid: this.uuid,
      },
    );
    if (!this.promiseTargets[key]) {
      const promiseTarget =
        createPromiseTarget<IHwAllNetworkPrepareAccountsItem>();
      this.promiseTargets[key] = promiseTarget;
    }
    const promiseTarget = this.promiseTargets[key];

    return promiseTarget;
  }

  buildItemPromiseTargetKey({
    path,
    hwSdkNetwork,
  }: {
    path: string;
    hwSdkNetwork: IHwSdkNetwork;
  }) {
    /*
        const account = hwAllNetworkPrepareAccountsResponse?.find(
        (item) =>
        item.network && item.path === path && item.network === hwSdkNetwork,
        );        
        */
    return `PromiseItem__${hwSdkNetwork}-${path}`;
  }

  _bundleLength = 0;

  get bundleLength() {
    return this._bundleLength;
  }

  set bundleLength(length: number) {
    this._bundleLength = length;
  }

  async getItem({
    path,
    hwSdkNetwork,
  }: {
    path: string;
    hwSdkNetwork: IHwSdkNetwork;
  }): Promise<IHwAllNetworkPrepareAccountsItem> {
    const promiseTarget = this.getOrCreateItemPromiseTarget({
      path,
      hwSdkNetwork,
    });
    return promiseTarget.ready;
  }

  async getAllItems(): Promise<IHwAllNetworkPrepareAccountsItem[]> {
    const promiseTargets = Object.values(this.promiseTargets);
    const items = await Promise.all(
      promiseTargets.map((target) => target.ready),
    );
    return items;
  }

  async getFirstErrorItem(): Promise<
    IHwAllNetworkPrepareAccountsItem | undefined
  > {
    const items = await this.getAllItems();
    /*
     const hasErrorItem = hwAllNetworkPrepareAccountsResponse?.find(
        (item) => !item.success && !!item.payload?.error,
        );
        */
    const errorItem = items.find(
      (item) => !item.success && !!item.payload?.error,
    );
    return errorItem || undefined;
  }
}
