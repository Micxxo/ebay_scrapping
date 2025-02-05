const handleCalculatePages = (limitFromReq) => {
  const defaultLimit = 60;
  let page = 1;
  let limit = defaultLimit;

  while (limitFromReq > page * limit) {
    page++;
  }

  return page;
};

module.exports = handleCalculatePages 
