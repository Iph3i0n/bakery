import { describe } from "../testing/browser.ts";
import { colours } from "../testing/utils.ts";

describe("d-card", (it) => {
  it("Draws a card", async (ctx) => {
    await ctx.load(
      `<d-card><span slot="title">Test Title</span>Test Card</d-card>`
    );
    await ctx.page.waitForSelector("d-card");
    await ctx.assert_snapshot(await ctx.element_snapshot("d-card"));
  });

  for (const colour of colours)
    it(`Draws a ${colour} card`, async (ctx) => {
      await ctx.load(
        `<d-card colour="${colour}"><span slot="title">Test Title</span>Test Alert</d-card>`
      );
      await ctx.page.waitForSelector("d-card");
      await ctx.assert_snapshot(await ctx.element_snapshot("d-card"));
    });
});
