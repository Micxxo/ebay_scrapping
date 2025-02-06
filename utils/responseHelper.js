const responseHelper = {
  success: ({
    res,
    data = null,
    pagination = null,
    message = "Success",
    statusCode = 200,
    additionalRes = {},
  }) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      page: pagination.page || 1,
      limit_per_page: pagination.limit_per_page || 60,
      totalData: pagination.totalData || 0,
      ...additionalRes,
    });
  },

  error: (
    res,
    message = "Something went wrong",
    statusCode = 500,
    errors = null
  ) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  },

  notFound: (res, message = "Page not found", statusCode = 404) => {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  },
};

module.exports = responseHelper;
