// Shared paging helpers so every list endpoint behaves identically.
//
// Convention:
//   - `?page=1&limit=20`
//   - limit is clamped to [1, 100]
//   - page is clamped to [1, ∞)
//   - response shape: { items, totalCount, nextPage } where nextPage is -1 when exhausted

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export const parsePaging = (query) => {
    let page = parseInt(query.page, 10);
    let limit = parseInt(query.limit, 10);
    if (!Number.isFinite(page) || page < 1) page = 1;
    if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    return { page, limit, skip: (page - 1) * limit };
};

export const buildPagedResult = (items, totalCount, page, limit, key = 'items') => ({
    [key]: items,
    totalCount,
    nextPage: totalCount > limit * page ? page + 1 : -1,
});
