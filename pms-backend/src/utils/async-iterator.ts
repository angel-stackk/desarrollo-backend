export interface BatchResponse<T> {
  items: T[];
  nextPage: number | null;
}

export async function* fetchInBatches(
  fetcher: (page: number) => Promise<BatchResponse<any>>
): AsyncGenerator<any[], void, unknown> {
  let page: number | null = 1;
  while (page !== null) {
    const response = await fetcher(page);
    yield response.items;
    page = response.nextPage;
  }
}

export async function processPagedTasks(): Promise<void> {
  const mockFetcher = async (p: number): Promise<BatchResponse<string>> => {
    if (p > 3) return { items: [], nextPage: null };
    return { items: [`Tarea-${p}-1`, `Tarea-${p}-2`], nextPage: p + 1 };
  };

  for await (const batch of fetchInBatches(mockFetcher)) {
    console.log(`[Batch] Procesados ${batch.length} elementos:`, batch);
  }
}
