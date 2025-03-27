export default {
  routes: [
    {
      method: "GET",
      path: "/user-history/:name_user",
      handler: "user-history.findOne",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
