import { apiClient } from '@/lib/api-client';

describe('apiClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retries on 429 responses', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response('Too Many Requests', { status: 429 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    const result = await apiClient('/health');
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws structured error when response payload includes message', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'not allowed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    await expect(apiClient('/secure')).rejects.toMatchObject({
      status: 403,
      message: 'not allowed',
    });
  });
});
