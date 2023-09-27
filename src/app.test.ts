import { it, afterAll, beforeAll, describe } from "@bdd";
import Puppeteer, { Browser, Page } from "@puppeteer";
import * as Path from "@path";
import { assertSnapshot } from "@snapshot";
const __dirname = Path.dirname(Path.fromFileUrl(import.meta.url));

describe("App", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await Puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  async function load(html: string) {
    await page.addScriptTag({
      content: await Deno.readTextFile(
        Path.resolve(__dirname, "../dist/bundle.min.js")
      ),
    });
    await page.setContent(html);
  }

  async function element_snapshot(selector: string) {
    return await page.evaluate((selector) => {
      const cycle_through = (
        element: Element | ShadowRoot | null | undefined
      ): Array<any> => {
        if (!element) return [];

        const result = [];
        for (const ele of element.childNodes)
          if (ele instanceof Text) result.push(ele.textContent);
          else if (ele instanceof Element)
            if (ele.tagName !== "STYLE")
              result.push({
                tag: ele.tagName,
                styles: get_styles(ele),
                children: cycle_through(ele),
                role: ele.role,
              });

        return result;
      };

      const get_styles = (element: Element | null | undefined) => {
        if (!element) return {};
        const style = getComputedStyle(element);
        const result: Record<string, string> = {};
        for (const key in style)
          if (typeof style[key] === "string" && isNaN(key as unknown as number))
            result[key] = style[key];
        return result;
      };
      const target = document.body.querySelector(selector);
      if (!target) throw new Error("Could not find element");

      return {
        host: get_styles(target),
        role: target.role,
        children: cycle_through(target.shadowRoot),
      };
    }, selector);
  }

  describe("d-alert", () => {
    it("Draws an alert", async (t) => {
      await load(`<d-alert>Test Alert</d-alert>`);
      await page.waitForSelector("d-alert");
      await assertSnapshot(t, await element_snapshot("d-alert"));
    });
  });
});
