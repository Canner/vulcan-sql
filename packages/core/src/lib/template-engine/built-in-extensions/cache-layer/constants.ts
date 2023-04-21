export const METADATA_NAME = 'cache.vulcan.com';
// The variable name for indicating the cache layer query builder would like to get result directly.
// The scenario happened when the SQL query is last line to get final result and replace the "__wrapped__builder" final builder to return.
// Then you could get the result from cache layer directly and not keep to variable.
export const CACHE_DIRECTLY_QUERY_VAR_NAME = '__directly_query_cache__';
