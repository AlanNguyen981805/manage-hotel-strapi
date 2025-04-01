/**
 * history controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::history.history",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        const { code, history, time_search, users_permissions_user } = data;
        // Generate code in format: 237 - 250525 - 142 PAX (order number - start date - number of passengers)

        // Get current date in YYMMDD format
        const today = new Date();
        const dateFormatted = `${today.getFullYear().toString().slice(-2)}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;

        // Get the count of histories for the current month to determine order number
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );

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

        // Get the logged-in user's name
        const user = ctx.state.user;
        const userName = user ? user.username : "Anonymous";

        // Format the code with username in the center
        const generatedCode = `${orderNumber} - ${userName} - ${dateFormatted} - 1 PAX`;

        const newHistory = await strapi.db.transaction(async (trx) => {
          return await strapi.db.query("api::history.history").create({
            data: {
              code: generatedCode,
              history,
              time_search,
              users_permissions_user,
            },
          });
        });

        // Return the created entity
        return { data: newHistory };
      } catch (error) {
        ctx.body = error;
        ctx.status = 500;
        return ctx.body;
      }
    },
  })
);
