export function paginate<T>(
  data: T[],
  page: number,
  perPage: number,
  totalItems: number,
) {
  return {
    data,
    pagination: {
      currentPage: page,
      perPage,
      totalItems,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < Math.ceil(totalItems / perPage) ? page + 1 : null,
    },
  };
}
