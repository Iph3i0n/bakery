import { describe } from "../testing/browser.ts";
import { colours } from "../testing/utils.ts";

describe("d-alert", (it) => {
  it("Draws an alert", async (ctx) => {
    await ctx.load(`<d-alert>Test Alert</d-alert>`);
    await ctx.page.waitForSelector("d-alert");
    await ctx.assert_snapshot(await ctx.element_snapshot("d-alert"));
  });

  for (const colour of colours)
    it(`Draws a ${colour} alert`, async (ctx) => {
      await ctx.load(`<d-alert colour="${colour}">Test Alert</d-alert>`);
      await ctx.page.waitForSelector("d-alert");
      await ctx.assert_snapshot(await ctx.element_snapshot("d-alert"));
    });

  it("Draws a close button", async (ctx) => {
    await ctx.load(`<d-alert closeable>Test Alert</d-alert>`);
    await ctx.page.waitForSelector("d-alert");
    await ctx.assert_snapshot(await ctx.element_snapshot("d-alert"));
  });

  it("Closes on a close button", async (ctx) => {
    await ctx.load(`<d-alert closeable>Test Alert</d-alert>`);
    await ctx.page.waitForSelector("d-alert");
    await ctx.deep_click("d-alert", ".close-button");
    await ctx.wait_for_destroy("d-alert");
  });
});
