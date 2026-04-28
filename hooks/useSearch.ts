"use client"

import { useCallback, useEffect, useState } from "react"
import type { SearchResponse } from "@/types/search"
import { searchAll } from "@/services/search.service"

export function useSearch(q: string) {
    const [data, setData] = useState<SearchResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const run = useCallback(async () => {
        const query = q.trim()
        if (!query) {
            setData({ q: "", users: [], projects: [], tasks: [] })
            setError(null)
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            const payload = await searchAll(query)
            setData(payload)
        } catch {
            setError("Không thể tìm kiếm")
            setData(null)
        } finally {
            setLoading(false)
        }
    }, [q])

    useEffect(() => {
        void run()
    }, [run])

    return { data, loading, error, run }
}

