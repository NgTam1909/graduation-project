import { GET_METHOD } from "@/lib/req"
import type { SearchResponse } from "@/types/search"

export async function searchAll(q: string, opts?: { limit?: number }) {
    const query = q.trim()
    if (!query) {
        return {
            q: "",
            users: [],
            projects: [],
            tasks: [],
        } satisfies SearchResponse
    }

    const params = new URLSearchParams({ q: query })
    if (opts?.limit) params.set("limit", String(opts.limit))

    return (await GET_METHOD(`/api/search?${params.toString()}`)) as SearchResponse
}

