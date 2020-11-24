import { logger } from '../../../../../../logger/logger';
import { WorkPage } from './work.po';
import { CommonHelper } from '../../../common-page/common.helper';

export class WorkPageHelper {
  /**
   * sets the Work page object
   */
  public static setWorkPage(workPage) {
    this.workPageObject = workPage;
  }

  /**
   * Opens the work page in the browser
   */
  public static async open() {
    this.workPageObject = new WorkPage();
    await this.workPageObject.open();
  }

  /**
   * Deletes all work experiences
   */
  public static async deleteAll() {
    await this.workPageObject.deleteAllWorks();
  }

  /**
   * Adds a work experience
   * @param work - object representation of work experience
   */
  public static async verifyAddWork(work) {
    const name = this.getName(work);
    await this.workPageObject.addWork(work);
    await this.workPageObject.waitForDefaultSuccessMessage();
    const isDisplayed = await CommonHelper.isPresent(
      CommonHelper.findElementByText('div', name)
    );
    expect(isDisplayed).toBe(true);
    logger.info('work added: ' + name);
  }

  /**
   * Updates a work experience
   * @param work - object representation of already added work experience
   * @param newWork - object representation of new work experience
   */
  public static async verifyEditWork(work, newWork) {
    const name = this.getName(work);
    const newName = this.getName(newWork);

    await this.workPageObject.editWork(work, newWork);
    await this.workPageObject.waitForDefaultSuccessMessage();

    const isDisplayed = await CommonHelper.isPresent(
      CommonHelper.findElementByText('div', newName)
    );
    expect(isDisplayed).toBe(true);
    logger.info('work edited from: ' + name + ' to ' + newName);
  }

  /**
   * Deletes a work experience
   * @param work
   */
  public static async verifyDeleteWork(work) {
    const name = this.getName(work);
    await this.workPageObject.deleteWork(work);
    await this.workPageObject.waitForDefaultSuccessMessage();
    const isDisplayed = await CommonHelper.isPresent(
      CommonHelper.findElementByText('div', name)
    );
    expect(isDisplayed).toBe(false);
    logger.info('deleted work: ' + name);
  }

  /**
   * Gets name of work experience which would be used to query in UI
   * @param work
   */
  private static getName(work) {
    return this.workPageObject.getName(work);
  }

  private static workPageObject: WorkPage;
}
