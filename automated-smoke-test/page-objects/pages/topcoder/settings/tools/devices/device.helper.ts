import { logger } from '../../../../../../logger/logger';
import { DevicePage } from './device.po';
import { CommonHelper } from '../../../common-page/common.helper';

export class DevicePageHelper {
  /**
   * Opens the tools page in the browser
   */
  public static async open() {
    this.devicePageObject = new DevicePage();
    await this.devicePageObject.open();
  }

  /**
   * deletes all entries in the current tab
   */
  public static async deleteAll() {
    await this.devicePageObject.deleteAllDevices();
  }

  /**
   * verifyies that user can add device
   */
  public static async verifyAddDevice(device) {
    const name = this.getDeviceName(device);
    await this.devicePageObject.addDevice(device);
    await this.devicePageObject.waitForDefaultSuccessMessage();
    const isDisplayed = await CommonHelper.isPresent(
      CommonHelper.findElementByText('div', name)
    );
    expect(isDisplayed).toBe(true);
    logger.info('device added: ' + name);
  }

  /**
   * verifyies that user can edit device
   */
  public static async verifyEditDevice(device, newDevice) {
    const name = this.getDeviceName(device);
    const newName = this.getDeviceName(newDevice);

    await this.devicePageObject.editDevice(device, newDevice);
    await this.devicePageObject.waitForDefaultSuccessMessage();

    const isDisplayed = await CommonHelper.isPresent(
      CommonHelper.findElementByText('div', newName)
    );
    expect(isDisplayed).toBe(true);
    logger.info('device edited from: ' + name + ' to ' + newName);
  }

  /**
   * verifyies that user can delete device
   */
  public static async verifyDeleteDevice(device) {
    const name = this.getDeviceName(device);
    await this.devicePageObject.deleteDevice(device);
    await this.devicePageObject.waitForDefaultSuccessMessage();
    const isDisplayed = await CommonHelper.isPresent(
      CommonHelper.findElementByText('div', name)
    );
    expect(isDisplayed).toBe(false);
    logger.info('deleted device: ' + name);
  }

  /**
   * Gets the device name basis which the UI would be queried
   * @param device
   */
  private static getDeviceName(device): string {
    return `${device.model}`;
  }

  private static devicePageObject: DevicePage;
}
