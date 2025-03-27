/**
 * user-history controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::user-history.user-history",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { name_user } = ctx.params;
      const userHistory = await strapi.db
        .query("api::user-history.user-history")
        .findOne({
          where: {
            name_user: name_user,
          },
        });

      return userHistory;
    },
  })
);
