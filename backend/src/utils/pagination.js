/**
 * Standard Pagination Utilities
 */

export function getPaginationParams(query, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requestedLimit = parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
    from: offset,
    to: offset + limit - 1,
  };
}

export function formatPaginationMetadata(total, page, limit) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
