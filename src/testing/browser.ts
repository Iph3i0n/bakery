// deno-lint-ignore-file no-explicit-any
import * as Path from "@path";
import Puppeteer, { Browser, ElementHandle, Page } from "@puppeteer";
import * as bdd from "@bdd";
import { assertSnapshot } from "@snapshot";

const __dirname = Path.dirname(Path.fromFileUrl(import.meta.url));

const screenshot_dir = "./__screens__";

type BrowserTestContext = {
  page: Page;
  load: (html: string) => Promise<void>;
  element_snapshot: (selector: string) => Promise<unknown>;
  get_handle: (
    ...selectors: Array<string>
  ) => Promise<ElementHandle<Element | null>>;
  deep_click: (...selectors: Array<string>) => Promise<void>;
  wait_for_destroy: (selector: string) => Promise<void>;
  assert_snapshot: (data: unknown) => Promise<void>;
};

export function describe(
  name: string,
  create: (
    it: (name: string, imp: (ctx: BrowserTestContext) => Promise<void>) => void
  ) => void
) {
  bdd.describe(name, () => {
    let browser: Browser;
    let page: Page;

    const it = (name: string, imp: (t: Deno.TestContext) => Promise<void>) => {
      bdd.it(name, async (t) => {
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
        } catch (err) {
          await Deno.mkdir(screenshot_dir, { recursive: true });
          await page.screenshot({
            path: Path.join(screenshot_dir, name + ".png"),
          });

          throw err;
        }
      });
    };

    bdd.beforeAll(async () => {
      browser = await Puppeteer.launch();
      page = await browser.newPage();
    });

    bdd.afterAll(async () => {
      await page.close();
      await browser.close();
    });

    create((name, imp) =>
      it(name, (t) =>
        imp({
          page,
          async load(html: string) {
            await page.addScriptTag({
              content: await Deno.readTextFile(
                Path.resolve(__dirname, "../../dist/bundle.min.js")
              ),
            });
            await page.setContent(html);
          },
          async element_snapshot(selector: string) {
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
                  if (
                    typeof style[key] === "string" &&
                    isNaN(key as unknown as number)
                  )
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
          },
          async get_handle(...selectors: Array<string>) {
            return await page.evaluateHandle(
              (...selectors) =>
                selectors.slice(1).reduce((c, n) => {
                  const result = c?.shadowRoot?.querySelector(n);
                  if (!result) throw new Error("Cannot find handle");
                  return result;
                }, document.querySelector(selectors[0])),
              ...selectors
            );
          },
          async deep_click(...selectors: Array<string>) {
            const handle = await this.get_handle(...selectors);

            await handle.click();
          },
          async wait_for_destroy(selector: string) {
            await page.waitForFunction(
              `!document.querySelector('${selector}')`
            );
          },
          async assert_snapshot(data) {
            await assertSnapshot(t, data);
          },
        })
      )
    );
  });
}
