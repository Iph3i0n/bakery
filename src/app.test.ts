import { it as org, afterAll, beforeAll, describe } from "@bdd";
import Puppeteer, { Browser, Page } from "@puppeteer";
import * as Path from "@path";
import { assertSnapshot } from "@snapshot";
import { assert } from "@assert";
const __dirname = Path.dirname(Path.fromFileUrl(import.meta.url));

const screenshot_dir = "./__screens__";

const colours = [
  "body",
  "headline",
  "surface",
  "primary",
  "contrast",
  "warning",
  "rainbow_0",
  "rainbow_1",
  "rainbow_2",
  "rainbow_3",
  "rainbow_4",
  "rainbow_5",
  "rainbow_6",
  "rainbow_7",
  "rainbow_8",
  "rainbow_9",
] as const;

describe("App", () => {
  let browser: Browser;
  let page: Page;

  const it = (name: string, imp: (t: Deno.TestContext) => Promise<void>) => {
    org(name, async (t) => {
      let c: Deno.TestContext | undefined = t;
      const tests = [];
      while (c) {
        tests.push(c);
        c = c.parent;
      }

      const name = tests
        .map((t) => t.name)
        .reverse()
        .join(" - ");
      try {
        await imp(t);
      } finally {
        await Deno.mkdir(screenshot_dir, { recursive: true });
        await page.screenshot({
          path: Path.join(screenshot_dir, name + ".png"),
        });
      }
    });
  };

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

  async function deep_click(...selectors: Array<string>) {
    const handle = await page.evaluateHandle(
      (...selectors) =>
        selectors.slice(1).reduce((c, n) => {
          const result = c?.shadowRoot?.querySelector(n);
          if (!result) throw new Error("Cannot find handle");
          return result;
        }, document.querySelector(selectors[0])),
      ...selectors
    );

    await handle.click();
  }

  async function exists(selector: string) {
    try {
      await page.$(selector);
      return true;
    } catch {
      return false;
    }
  }

  async function wait_for_destroy(selector: string) {
    await page.waitForFunction(`!document.querySelector('${selector}')`);
  }

  describe("d-alert", () => {
    it("Draws an alert", async (t) => {
      await load(`<d-alert>Test Alert</d-alert>`);
      await page.waitForSelector("d-alert");
      await assertSnapshot(t, await element_snapshot("d-alert"));
    });

    for (const colour of colours)
      it(`Draws a ${colour} alert`, async (t) => {
        await load(`<d-alert colour="${colour}">Test Alert</d-alert>`);
        await page.waitForSelector("d-alert");
        await assertSnapshot(t, await element_snapshot("d-alert"));
      });

    it("Draws a close button", async (t) => {
      await load(`<d-alert closeable>Test Alert</d-alert>`);
      await page.waitForSelector("d-alert");
      await assertSnapshot(t, await element_snapshot("d-alert"));
    });

    it("Closes on a close button", async () => {
      await load(`<d-alert closeable>Test Alert</d-alert>`);
      await page.waitForSelector("d-alert");
      await deep_click("d-alert", ".close-button");
      await wait_for_destroy("d-alert");
    });
  });

  describe("d-card", () => {
    it("Draws a card", async (t) => {
      await load(
        `<d-card><span slot="title">Test Title</span>Test Card</d-card>`
      );
      await page.waitForSelector("d-card");
      await assertSnapshot(t, await element_snapshot("d-card"));
    });

    for (const colour of colours)
      it(`Draws a ${colour} card`, async (t) => {
        await load(
          `<d-card colour="${colour}"><span slot="title">Test Title</span>Test Alert</d-card>`
        );
        await page.waitForSelector("d-card");
        await assertSnapshot(t, await element_snapshot("d-card"));
      });
  });
});
