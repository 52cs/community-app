import { logger } from '../../../../../../logger/logger';
import { ServiceProviderPage } from './service-provider.po';
import { CommonHelper } from '../../../common-page/common.helper';

export class ServiceProviderPageHelper {
  /**
   * gets the Tools page object
   */
  public static setServiceProviderPage(serviceProviderPage) {
    this.serviceProviderPageObject = serviceProviderPage;
  }

  /**
   * Opens the tools page in the browser
   */
  public static async open() {
    this.serviceProviderPageObject = new ServiceProviderPage();
    await this.serviceProviderPageObject.open();
  }

  /**
   * deletes all entries in the current tab
   */
  public static async deleteAll() {
    await this.serviceProviderPageObject.deleteAllServiceProviders();
  }

  /**
   * verifyies that user can add service provider
   */
  public static async verifyAddServiceProvider(serviceProvider) {
    await this.serviceProviderPageObject.addServiceProvider(serviceProvider);
    await this.serviceProviderPageObject.waitForDefaultSuccessMessage();
    const isDisplayed = await CommonHelper.isPresent(
      CommonHelper.findElementByText('div', serviceProvider.name)
    );
    expect(isDisplayed).toBe(true);
    logger.info('serviceProvider added: ' + serviceProvider.name);
  }

  /**
   * verifyies that user can edit service provider
   */
  public static async verifyEditServiceProvider(
    serviceProvider,
    newServiceProvider
  ) {
    await this.serviceProviderPageObject.editServiceProvider(
      serviceProvider,
      newServiceProvider
    );
    await this.serviceProviderPageObject.waitForDefaultSuccessMessage();
    const isDisplayed = await CommonHelper.isPresent(
      CommonHelper.findElementByText('div', newServiceProvider.name)
    );
    expect(isDisplayed).toBe(true);
    logger.info(
      'serviceProvider edited from: ' +
        serviceProvider.name +
        ' to ' +
        newServiceProvider.name
    );
  }

  /**
   * verifyies that user can delete service provider
   */
  public static async verifyDeleteServiceProvider(serviceProvider) {
    await this.serviceProviderPageObject.deleteServiceProvider(serviceProvider);
    await this.serviceProviderPageObject.waitForDefaultSuccessMessage();
    const isDisplayed = await CommonHelper.isPresent(
      CommonHelper.findElementByText('div', serviceProvider.name)
    );
    expect(isDisplayed).toBe(false);
    logger.info('deleted serviceProvider: ' + serviceProvider.name);
  }

  private static serviceProviderPageObject: ServiceProviderPage;
}
