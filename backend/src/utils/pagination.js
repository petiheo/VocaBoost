class PaginationUtil {
  static validate(page, limit, maxLimit = 100) {
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(Math.max(1, parseInt(limit) || 10), maxLimit);

    return {
      page: validatedPage,
      limit: validatedLimit,
      offset: (validatedPage - 1) * validatedLimit,
    };
  }

  static buildResponse(data, pagination, totalCount) {
    const { page, limit } = pagination;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
      },
    };
  }

  static async execute(query, pagination, countQuery = null) {
    const { limit, offset } = pagination;

    // Apply pagination to the query
    const paginatedQuery = query.range(offset, offset + limit - 1);

    // Execute paginated query
    const { data, error, count } = await paginatedQuery;

    if (error) {
      throw error;
    }

    // Get total count if not provided by the query
    let totalCount = count;
    if (totalCount === null && countQuery) {
      const { count: totalCountResult, error: countError } = await countQuery;
      if (countError) {
        throw countError;
      }
      totalCount = totalCountResult;
    }

    return this.buildResponse(data, pagination, totalCount || 0);
  }

  static getMetadata(page, limit, totalCount) {
    const totalPages = Math.ceil(totalCount / limit);

    return {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    };
  }

  static buildSupabaseQuery(baseQuery, pagination, selectColumns = '*') {
    const { limit, offset } = pagination;

    return baseQuery
      .select(selectColumns, { count: 'exact' })
      .range(offset, offset + limit - 1);
  }
}

module.exports = PaginationUtil;
