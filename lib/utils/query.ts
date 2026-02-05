import queryString from 'query-string';

export function formUrlQuery({
  params,
  updates,
  baseUrl,
}: {
  params: string;
  updates: Record<string, string | number | null>;
  baseUrl: string;
}) {
  const currentUrl = queryString.parse(params);

  // Merge current params with updates
  // If a value is null, it will be removed
  const newParams = {
    ...currentUrl,
    ...updates,
  };

  return queryString.stringifyUrl(
    {
      url: baseUrl,
      query: newParams,
    },
    { skipNull: true, skipEmptyString: true }
  );
}

export function removeKeysFromQuery({
  params,
  keysToRemove,
  baseUrl,
}: {
  params: string;
  keysToRemove: string[];
  baseUrl: string;
}) {
  const currentUrl = queryString.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return queryString.stringifyUrl(
    {
      url: baseUrl,
      query: currentUrl,
    },
    { skipNull: true }
  );
}
