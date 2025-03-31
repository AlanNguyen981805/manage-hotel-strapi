/**
 * history controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::history.history",
  ({ strapi }) => ({
    async create(ctx) {
      const { code, history, time_search } = ctx.request.body;
      // Generate code in format: 237 - 250525 - 142 PAX (order number - start date - number of passengers)

      // Get current date in YYMMDD format
      const today = new Date();
      const dateFormatted = `${today.getFullYear().toString().slice(-2)}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;

      // Get the count of histories for the current month to determine order number
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const monthlyHistories = await strapi.db
        .query("api::history.history")
        .count({
          where: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        });

      // Generate the order number (count + 1)
      const orderNumber = monthlyHistories + 1;

      // Format the code
      const generatedCode = `${orderNumber} - ${dateFormatted} - ${code} PAX`;

      await strapi.db.query("api::history.history").create({
        data: {
          code: generatedCode,
          history,
          time_search,
        },
      });

      return history;
    },
  })
);
