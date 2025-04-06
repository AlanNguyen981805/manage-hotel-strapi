import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::history.history",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        const { history, time_search, users_permissions_user } = data;

        const today = new Date();
        const dateFormatted = `${today.getDate().toString().padStart(2, "0")}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getFullYear().toString().slice(-2)}`;

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );

        // Get the latest history for the current month to determine the next order number
        const latestHistories = await strapi.db
          .query("api::history.history")
          .findMany({
            where: {
              createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth,
              },
            },
            orderBy: { createdAt: "desc" },
            limit: 1,
          });

        // Determine the next order number
        // Reset orderNumber to 1 at the beginning of each month and increment gradually
        let orderNumber = 1;
        if (latestHistories.length > 0) {
          // Extract the order number from the code if available
          const latestCode = latestHistories[0].code;
          if (latestCode) {
            const match = latestCode.match(/^(\d+)/);
            if (match && match[1]) {
              orderNumber = parseInt(match[1], 10) + 1;
            }
          }
        }

        const user = ctx.state.user;
        const userName = user ? user.username : "Anonymous";

        const generatedCode = `${orderNumber} - ${userName} - ${dateFormatted} - 1 PAX`;

        const newHistory = await strapi.entityService.create(
          "api::history.history",
          {
            data: {
              code: generatedCode,
              history,
              time_search,
              users_permissions_user,
            },
          }
        );

        return { data: newHistory };
      } catch (error) {
        ctx.body = error;
        ctx.status = 500;
        return ctx.body;
      }
    },
  })
);
